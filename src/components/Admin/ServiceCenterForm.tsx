import React, { useEffect } from 'react';
import { Form, Input, Select, Row, Col, Button, Divider, TimePicker, Switch } from 'antd';
import { ServiceCenterCreatePayload, ServiceCenterUpdatePayload, ServiceCenter } from '@/interfaces/serviceCenter';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { fetchServiceTypes } from '@/services/features/admin/seviceSlice';
import dayjs from 'dayjs';

type Mode = 'create' | 'edit';

interface ServiceCenterFormProps {
  mode: Mode;
  initialValues?: Partial<ServiceCenter> | Partial<ServiceCenterUpdatePayload>;
  loading?: boolean;
  onSubmit: (payload: ServiceCenterCreatePayload | ServiceCenterUpdatePayload) => void;
  onCancel: () => void;
}

const { Option } = Select;

const labelCol = { span: 24 } as const;
const wrapperCol = { span: 24 } as const;

const ServiceCenterForm: React.FC<ServiceCenterFormProps> = ({ mode, initialValues, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items: serviceTypeItems, loading: servicesLoading } = useAppSelector((state) => state.adminService);
  const PAYMENT_OPTIONS = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'banking', label: 'Chuyển khoản' },
    { value: 'ewallet', label: 'Ví điện tử' },
  ] as const;

  useEffect(() => {
    // Load service types for selection
    dispatch(fetchServiceTypes({ page: 1, limit: 1000 }));
    if (initialValues) {
      const sc = initialValues as any;
      const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
      const operatingHours = sc.operatingHours || {};
      const operatingFields: Record<string, any> = {};
      days.forEach((d) => {
        const v = operatingHours[d];
        if (v && v.open && v.close) {
          operatingFields[`operatingHours_${d}_isOpen`] = true;
          operatingFields[`operatingHours_${d}_range`] = [dayjs(v.open, 'HH:mm'), dayjs(v.close, 'HH:mm')];
        } else {
          operatingFields[`operatingHours_${d}_isOpen`] = false;
          operatingFields[`operatingHours_${d}_range`] = [];
        }
      });
      form.setFieldsValue({
        name: sc.name || '',
        description: sc.description || '',
        status: sc.status || 'active',
        addressStreet: sc.address?.street || '',
        addressWard: sc.address?.ward || '',
        addressDistrict: sc.address?.district || '',
        addressCity: sc.address?.city || '',
        ...operatingFields,
        contactPhone: sc.contact?.phone || '',
        contactEmail: sc.contact?.email || '',
        contactWebsite: sc.contact?.website || '',
        servicesIds: Array.isArray(sc.services)
          ? (typeof sc.services[0] === 'string'
              ? (sc.services as string[])
              : (sc.services as any[]).map((s: any) => s._id))
          : [],
        paymentMethodsSelection: Array.isArray(sc.paymentMethods)
          ? (sc.paymentMethods as any[]).filter((m: any) => m?.isEnabled).map((m: any) => m.type)
          : [],
        staffJson: JSON.stringify(Array.isArray(sc.staff) ? (sc.staff as any[]).map((s: any) => ({ user: s.user?._id || s.user, role: s.role, isActive: s.isActive })) : [], null, 2),
        imagesUrls: Array.isArray(sc.images)
          ? (typeof sc.images[0] === 'string'
              ? (sc.images as string[])
              : (sc.images as any[]).map((img: any) => img?.url).filter(Boolean))
          : [],
        capacityMaxConcurrentServices: sc.capacity?.maxConcurrentServices ?? undefined,
        capacityMaxDailyAppointments: sc.capacity?.maxDailyAppointments ?? undefined,
        ai_enableInventoryPrediction: !!sc.aiSettings?.enableInventoryPrediction,
        ai_enableMaintenancePrediction: !!sc.aiSettings?.enableMaintenancePrediction,
        ai_enableDemandForecasting: !!sc.aiSettings?.enableDemandForecasting,
        ratingAverage: sc.rating?.average ?? undefined,
        ratingCount: sc.rating?.count ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, dispatch]);

  const handleFinish = (values: any) => {
    try {
      const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
      const operatingHours = days.reduce((acc: any, d) => {
        const isOpen = !!values[`operatingHours_${d}_isOpen`];
        const range = values[`operatingHours_${d}_range`];
        const open = (Array.isArray(range) && range[0]?.format) ? range[0].format('HH:mm') : '';
        const close = (Array.isArray(range) && range[1]?.format) ? range[1].format('HH:mm') : '';
        acc[d] = { open, close, isOpen };
        return acc;
      }, {} as any);
      const staff = values.staffJson ? JSON.parse(values.staffJson) : [];
      const images = Array.isArray(values.imagesUrls)
        ? (values.imagesUrls as string[]).filter(Boolean).map((url) => ({ url, caption: '', isPrimary: false }))
        : [];
      const paymentMethods = Array.isArray(values.paymentMethodsSelection)
        ? (values.paymentMethodsSelection as string[]).map((t) => ({ type: t, isEnabled: true }))
        : [];
      const aiSettings = {
        enableInventoryPrediction: !!values.ai_enableInventoryPrediction,
        enableMaintenancePrediction: !!values.ai_enableMaintenancePrediction,
        enableDemandForecasting: !!values.ai_enableDemandForecasting,
      };
      const services = Array.isArray(values.servicesIds) ? values.servicesIds : [];

      const basePayload = {
        name: values.name,
        description: values.description,
        address: {
          street: values.addressStreet,
          ward: values.addressWard,
          district: values.addressDistrict,
          city: values.addressCity,
          coordinates: { lat: 0, lng: 0 },
        },
        contact: {
          phone: values.contactPhone,
          email: values.contactEmail,
          website: values.contactWebsite,
        },
        operatingHours,
        services,
        staff,
        capacity: {
          maxConcurrentServices: Number(values.capacityMaxConcurrentServices || 0),
          maxDailyAppointments: Number(values.capacityMaxDailyAppointments || 0),
        },
        status: values.status,
        images,
        rating: {
          average: values.ratingAverage ? Number(values.ratingAverage) : 0,
          count: values.ratingCount ? Number(values.ratingCount) : 0,
        },
        paymentMethods,
        aiSettings,
      } as ServiceCenterCreatePayload;

      if (mode === 'edit' && (initialValues as any)?._id) {
        const payload: ServiceCenterUpdatePayload = { ...basePayload, _id: (initialValues as any)._id };
        onSubmit(payload);
      } else {
        // Often rating is server-managed on create; you may strip it if needed
        onSubmit(basePayload);
      }
    } catch (e) {
      onSubmit({} as any);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      onFinish={handleFinish}
      disabled={loading}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item label="Tên trung tâm" name="name" rules={[{ required: true, message: 'Nhập tên trung tâm' }]}>
            <Input placeholder="EVCare HCM Center" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Trạng thái" name="status" initialValue="active" rules={[{ required: true }]}>
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="maintenance">Bảo trì</Option>
              <Option value="inactive">Ngưng</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
      </Form.Item>

      <Divider>Địa chỉ</Divider>
      <Row gutter={16}>
        <Col span={12}><Form.Item label="Đường" name="addressStreet" rules={[{ required: true }]}><Input placeholder="123 Lê Lợi" /></Form.Item></Col>
        <Col span={12}><Form.Item label="Phường/Xã" name="addressWard" rules={[{ required: true }]}><Input placeholder="Bến Thành" /></Form.Item></Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}><Form.Item label="Quận/Huyện" name="addressDistrict" rules={[{ required: true }]}><Input placeholder="Quận 1" /></Form.Item></Col>
        <Col span={12}><Form.Item label="Tỉnh/Thành" name="addressCity" rules={[{ required: true }]}><Input placeholder="Hồ Chí Minh" /></Form.Item></Col>
      </Row>
      

      <Divider>Liên hệ</Divider>
      <Row gutter={16}>
        <Col span={8}><Form.Item label="SĐT" name="contactPhone" rules={[{ required: true }]}><Input placeholder="02839123456" /></Form.Item></Col>
        <Col span={8}><Form.Item label="Email" name="contactEmail" rules={[{ required: true, type: 'email' }]}><Input placeholder="hcmcenter@evcare.vn" /></Form.Item></Col>
        <Col span={8}><Form.Item label="Website" name="contactWebsite"><Input placeholder="https://hcm.evcare.vn" /></Form.Item></Col>
      </Row>

      <Divider>Cấu hình chi tiết</Divider>
      <Row gutter={16}>
        {[
          { key: 'monday', label: 'Thứ 2' },
          { key: 'tuesday', label: 'Thứ 3' },
          { key: 'wednesday', label: 'Thứ 4' },
          { key: 'thursday', label: 'Thứ 5' },
          { key: 'friday', label: 'Thứ 6' },
          { key: 'saturday', label: 'Thứ 7' },
          { key: 'sunday', label: 'Chủ nhật' },
        ].map((d) => (
          <Col span={12} key={d.key}>
            <div className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{d.label}</span>
                <Form.Item name={`operatingHours_${d.key}_isOpen`} valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <Form.Item name={`operatingHours_${d.key}_range`}>
                <TimePicker.RangePicker format="HH:mm" minuteStep={15} className="w-full" />
              </Form.Item>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Dịch vụ" name="servicesIds" rules={[{ required: true, message: 'Chọn ít nhất 1 dịch vụ' }]}>
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ cung cấp"
              loading={servicesLoading}
              optionFilterProp="label"
              options={(serviceTypeItems || []).map((s: any) => ({ label: s.name, value: s._id }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Nhân sự (JSON)" name="staffJson">
            <Input.TextArea rows={4} spellCheck={false} placeholder='[{"user":"id","role":"staff","isActive":true}]' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Hình ảnh (URL)">
            <Form.List name="imagesUrls">
              {(fields, { add, remove }) => (
                <div>
                  <Button type="dashed" onClick={() => add('')} className="mb-2">Thêm URL</Button>
                  {fields.map((field) => (
                    <div key={field.key} className="flex gap-2 mb-2">
                      <Form.Item {...field} name={[field.name]} className="flex-1" rules={[{ required: true, message: 'Nhập URL hình ảnh' }]}>
                        <Input placeholder="https://.../image.jpg" />
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)}>Xóa</Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.List>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phương thức thanh toán" name="paymentMethodsSelection" rules={[{ required: true, message: 'Chọn ít nhất 1 phương thức' }]}>
            <Row gutter={[12, 12]}>
              {PAYMENT_OPTIONS.map((opt) => {
                const selected: string[] = Form.useWatch?.("paymentMethodsSelection", form) || [];
                const isActive = selected.includes(opt.value as any);
                const toggle = (checked: boolean) => {
                  const next = checked ? [...selected, opt.value] : selected.filter((v) => v !== opt.value);
                  form.setFieldsValue({ paymentMethodsSelection: Array.from(new Set(next)) });
                };
                return (
                  <Col span={12} key={opt.value}>
                    <div className={`border rounded-md p-3 flex items-center justify-between ${isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                      <span className="font-medium">{opt.label}</span>
                      <Switch checked={isActive} onChange={toggle} />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Sức chứa - Dịch vụ đồng thời" name="capacityMaxConcurrentServices" rules={[{ required: true }]}>
            <Input type="number" placeholder="15" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Sức chứa - Lịch/ngày" name="capacityMaxDailyAppointments" rules={[{ required: true }]}>
            <Input type="number" placeholder="80" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Divider>AI Settings</Divider>
          <div className="grid grid-cols-1 gap-3">
            <Form.Item label="Dự đoán tồn kho" name="ai_enableInventoryPrediction" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Dự đoán bảo trì" name="ai_enableMaintenancePrediction" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Dự báo nhu cầu" name="ai_enableDemandForecasting" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Col>
        {mode === 'edit' && (
          <Col span={12}>
            <Row gutter={8}>
              <Col span={12}><Form.Item label="Rating Average" name="ratingAverage"><Input type="number" step="0.1" placeholder="4.7" /></Form.Item></Col>
              <Col span={12}><Form.Item label="Rating Count" name="ratingCount"><Input type="number" placeholder="128" /></Form.Item></Col>
            </Row>
          </Col>
        )}
      </Row>

      <Divider />
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Hủy</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </Form>
  );
};

export default ServiceCenterForm;
