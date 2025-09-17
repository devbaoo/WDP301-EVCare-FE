import React, { useEffect } from 'react';
import { Form, Input, Select, Row, Col, Button, Divider } from 'antd';
import { ServiceCenterCreatePayload, ServiceCenterUpdatePayload, ServiceCenter } from '@/interfaces/serviceCenter';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { fetchServiceTypes } from '@/services/features/admin/seviceSlice';

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

  useEffect(() => {
    // Load service types for selection
    dispatch(fetchServiceTypes({ page: 1, limit: 1000 }));
    if (initialValues) {
      const sc = initialValues as any;
      form.setFieldsValue({
        name: sc.name || '',
        description: sc.description || '',
        status: sc.status || 'active',
        addressStreet: sc.address?.street || '',
        addressWard: sc.address?.ward || '',
        addressDistrict: sc.address?.district || '',
        addressCity: sc.address?.city || '',
        addressLat: sc.address?.coordinates?.lat ?? undefined,
        addressLng: sc.address?.coordinates?.lng ?? undefined,
        contactPhone: sc.contact?.phone || '',
        contactEmail: sc.contact?.email || '',
        contactWebsite: sc.contact?.website || '',
        operatingHoursJson: JSON.stringify(sc.operatingHours || {}, null, 2),
        servicesIds: Array.isArray(sc.services)
          ? (typeof sc.services[0] === 'string'
              ? (sc.services as string[])
              : (sc.services as any[]).map((s: any) => s._id))
          : [],
        staffJson: JSON.stringify(Array.isArray(sc.staff) ? (sc.staff as any[]).map((s: any) => ({ user: s.user?._id || s.user, role: s.role, isActive: s.isActive })) : [], null, 2),
        imagesJson: JSON.stringify(sc.images || [], null, 2),
        capacityMaxConcurrentServices: sc.capacity?.maxConcurrentServices ?? undefined,
        capacityMaxDailyAppointments: sc.capacity?.maxDailyAppointments ?? undefined,
        paymentMethodsJson: JSON.stringify(sc.paymentMethods || [], null, 2),
        aiSettingsJson: JSON.stringify(sc.aiSettings || {}, null, 2),
        ratingAverage: sc.rating?.average ?? undefined,
        ratingCount: sc.rating?.count ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form, dispatch]);

  const handleFinish = (values: any) => {
    try {
      const operatingHours = values.operatingHoursJson ? JSON.parse(values.operatingHoursJson) : {};
      const staff = values.staffJson ? JSON.parse(values.staffJson) : [];
      const images = values.imagesJson ? JSON.parse(values.imagesJson) : [];
      const paymentMethods = values.paymentMethodsJson ? JSON.parse(values.paymentMethodsJson) : [];
      const aiSettings = values.aiSettingsJson ? JSON.parse(values.aiSettingsJson) : {};
      const services = Array.isArray(values.servicesIds) ? values.servicesIds : [];

      const basePayload = {
        name: values.name,
        description: values.description,
        address: {
          street: values.addressStreet,
          ward: values.addressWard,
          district: values.addressDistrict,
          city: values.addressCity,
          coordinates: { lat: Number(values.addressLat), lng: Number(values.addressLng) },
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
      <Row gutter={16}>
        <Col span={12}><Form.Item label="Vĩ độ (lat)" name="addressLat" rules={[{ required: true }]}><Input type="number" placeholder="10.776889" /></Form.Item></Col>
        <Col span={12}><Form.Item label="Kinh độ (lng)" name="addressLng" rules={[{ required: true }]}><Input type="number" placeholder="106.700806" /></Form.Item></Col>
      </Row>

      <Divider>Liên hệ</Divider>
      <Row gutter={16}>
        <Col span={8}><Form.Item label="SĐT" name="contactPhone" rules={[{ required: true }]}><Input placeholder="02839123456" /></Form.Item></Col>
        <Col span={8}><Form.Item label="Email" name="contactEmail" rules={[{ required: true, type: 'email' }]}><Input placeholder="hcmcenter@evcare.vn" /></Form.Item></Col>
        <Col span={8}><Form.Item label="Website" name="contactWebsite"><Input placeholder="https://hcm.evcare.vn" /></Form.Item></Col>
      </Row>

      <Divider>Cấu hình chi tiết</Divider>
      <Form.Item label="Giờ hoạt động (JSON)" name="operatingHoursJson" rules={[{ required: true, message: 'Nhập giờ hoạt động JSON' }]}>
        <Input.TextArea rows={6} spellCheck={false} placeholder={'{ "monday": { "open": "08:00", ... } }'} />
      </Form.Item>

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
          <Form.Item label="Hình ảnh (JSON)" name="imagesJson">
            <Input.TextArea rows={4} spellCheck={false} placeholder='[{"url":"...","caption":"...","isPrimary":true}]' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Phương thức thanh toán (JSON)" name="paymentMethodsJson">
            <Input.TextArea rows={4} spellCheck={false} placeholder='[{"type":"cash","isEnabled":true}]' />
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
        <Col span={12}><Form.Item label="AI Settings (JSON)" name="aiSettingsJson"><Input.TextArea rows={4} spellCheck={false} placeholder='{"enableInventoryPrediction":true,...}' /></Form.Item></Col>
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
