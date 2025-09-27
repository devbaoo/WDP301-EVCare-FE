import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Row, Col, Button, TimePicker, Switch, Card, Typography, message } from 'antd';
import { 
  FileTextOutlined,
  HomeOutlined,
  PhoneOutlined,
  FieldTimeOutlined,
  AppstoreOutlined,
  PictureOutlined,
  SettingOutlined,
  
} from '@ant-design/icons';
import { ServiceCenterCreatePayload, ServiceCenterUpdatePayload, ServiceCenter } from '@/interfaces/serviceCenter';
import { useAppDispatch, useAppSelector } from '@/services/store/store';
import { fetchServiceTypes } from '@/services/features/admin/seviceSlice';
import dayjs from 'dayjs';
import MapboxPicker from '../Mapbox/MapboxPicker';
// import removed: staff selection no longer used

type Mode = 'create' | 'edit';

interface ServiceCenterFormProps {
  mode: Mode;
  initialValues?: Partial<ServiceCenter> | Partial<ServiceCenterUpdatePayload>;
  loading?: boolean;
  onSubmit: (payload: ServiceCenterCreatePayload | ServiceCenterUpdatePayload) => void;
  onCancel: () => void;
}

const { Option } = Select;
const { Title, Text } = Typography;

const labelCol = { span: 24 } as const;
const wrapperCol = { span: 24 } as const;

const ServiceCenterForm: React.FC<ServiceCenterFormProps> = ({ mode, initialValues, loading, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items: serviceTypeItems, loading: servicesLoading } = useAppSelector((state) => state.adminService);
  // removed staff states
  
  // Google Maps state
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const PAYMENT_OPTIONS = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'banking', label: 'Chuyển khoản' },
    { value: 'ewallet', label: 'Ví điện tử' },
  ] as const;

  useEffect(() => {
    // Load service types for selection
    dispatch(fetchServiceTypes({ page: 1, limit: 1000 }));
    // staff loading removed
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
      
      // Set coordinates for Google Maps
      if (sc.address?.coordinates) {
        setSelectedCoordinates({
          lat: sc.address.coordinates.lat,
          lng: sc.address.coordinates.lng
        });
      }
      
      // Set address for Google Maps
      if (sc.address) {
        const fullAddress = `${sc.address.street || ''}, ${sc.address.ward || ''}, ${sc.address.district || ''}, ${sc.address.city || ''}`.trim();
        setSelectedAddress(fullAddress);
      }
      
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
        // staff users removed
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
      setSelectedCoordinates(null);
      setSelectedAddress('');
    }
  }, [initialValues, form, dispatch]);

  // Handle Google Maps location selection
  const handleLocationSelect = (coordinates: { lat: number; lng: number }, address: string) => {
    setSelectedCoordinates(coordinates);
    setSelectedAddress(address);
  };

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
      // staff removed
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

      // Kiểm tra coordinates trước khi submit
      if (!selectedCoordinates || (selectedCoordinates.lat === 0 && selectedCoordinates.lng === 0)) {
        message.warning('Vui lòng chọn vị trí trên bản đồ trước khi lưu');
        return;
      }

      const basePayload = {
        name: values.name,
        description: values.description,
        address: {
          street: values.addressStreet,
          ward: values.addressWard,
          district: values.addressDistrict,
          city: values.addressCity,
          coordinates: selectedCoordinates,
        },
        contact: {
          phone: values.contactPhone,
          email: values.contactEmail,
          website: values.contactWebsite,
        },
        operatingHours,
        services,
        // staff removed
        capacity: {
          maxConcurrentServices: Number(values.capacityMaxConcurrentServices || 0),
          maxDailyAppointments: Number(values.capacityMaxDailyAppointments || 0),
        },
        status: values.status,
        images,
        // rating fields are server-managed
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
    <div className="w-full max-h-[70vh] overflow-y-auto">
      <Form
        form={form}
        layout="vertical"
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        onFinish={handleFinish}
        className="space-y-4"
      >
        <Card 
          title={<Title level={4} className="mb-0"><FileTextOutlined className="mr-2" />Thông tin cơ bản</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={16}>
              <Form.Item label={<Text strong>Tên trung tâm</Text>} name="name" rules={[{ required: true, message: 'Nhập tên trung tâm' }]}> 
                <Input placeholder="EVCare HCM Center" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Trạng thái</Text>} name="status" initialValue="active" rules={[{ required: true }]}> 
                <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="inactive">Ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={<Text strong>Mô tả</Text>} name="description">
                <Input.TextArea rows={3} placeholder="Mô tả ngắn..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card 
          title={<Title level={4} className="mb-0"><HomeOutlined className="mr-2" />Địa chỉ</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={12}><Form.Item label={<Text strong>Đường</Text>} name="addressStreet" rules={[{ required: true }]}><Input placeholder="123 Lê Lợi" /></Form.Item></Col>
            <Col span={12}><Form.Item label={<Text strong>Phường/Xã</Text>} name="addressWard" rules={[{ required: true }]}><Input placeholder="Bến Thành" /></Form.Item></Col>
            <Col span={12}><Form.Item label={<Text strong>Quận/Huyện</Text>} name="addressDistrict" rules={[{ required: true }]}><Input placeholder="Quận 1" /></Form.Item></Col>
            <Col span={12}><Form.Item label={<Text strong>Tỉnh/Thành</Text>} name="addressCity" rules={[{ required: true }]}><Input placeholder="Hồ Chí Minh" /></Form.Item></Col>
          </Row>
          
          {/* Mapbox Picker */}
          <div className="mt-4">
            <Text strong className="block mb-2">Chọn vị trí trên bản đồ</Text>
            <MapboxPicker
              onLocationSelect={handleLocationSelect}
              initialAddress={selectedAddress}
              initialCoordinates={selectedCoordinates || undefined}
              className="w-full"
            />
            {selectedCoordinates && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <Text type="secondary">
                  Tọa độ: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                </Text>
                <br />
                <Text type="secondary" className="text-xs">
                  Địa chỉ: {selectedAddress}
                </Text>
              </div>
            )}
            {!selectedCoordinates && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                <Text type="warning">
                  ⚠️ Vui lòng chọn vị trí trên bản đồ trước khi lưu
                </Text>
              </div>
            )}
          </div>
        </Card>

        <Card 
          title={<Title level={4} className="mb-0"><PhoneOutlined className="mr-2" />Liên hệ</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={8}><Form.Item label={<Text strong>SĐT</Text>} name="contactPhone" rules={[{ required: true }]}><Input placeholder="02839123456" /></Form.Item></Col>
            <Col span={8}><Form.Item label={<Text strong>Email</Text>} name="contactEmail" rules={[{ required: true, type: 'email' }]}><Input placeholder="hcmcenter@evcare.vn" /></Form.Item></Col>
            <Col span={8}><Form.Item label={<Text strong>Website</Text>} name="contactWebsite"><Input placeholder="https://hcm.evcare.vn" /></Form.Item></Col>
          </Row>
        </Card>

        <Card 
          title={<Title level={4} className="mb-0"><FieldTimeOutlined className="mr-2" />Giờ hoạt động</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
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
        </Card>

        <Card 
          title={<Title level={4} className="mb-0"><AppstoreOutlined className="mr-2" />Dịch vụ</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Form.Item label={<Text strong>Dịch vụ</Text>} name="servicesIds" rules={[{ required: true, message: 'Chọn ít nhất 1 dịch vụ' }]}> 
                <Select
                  mode="multiple"
                  placeholder="Chọn dịch vụ cung cấp"
                  loading={servicesLoading}
                  optionFilterProp="label"
                  options={(serviceTypeItems || []).map((s: any) => ({ label: s.name, value: s._id }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        

        <Card 
          title={<Title level={4} className="mb-0"><PictureOutlined className="mr-2" />Hình ảnh & Thanh toán</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Form.Item label={<Text strong>Hình ảnh (URL)</Text>}>
                <Form.List name="imagesUrls">
                  {(fields, { add, remove }) => (
                    <div>
                      <Button type="dashed" size="small" onClick={() => add('')} className="mb-2 min-w-[120px]">Thêm URL</Button>
                      {fields.map((field) => {
                        const { key, name } = field;
                        return (
                          <div key={key} className="flex gap-2 mb-2">
                            <Form.Item 
                              name={[name]} 
                              className="flex-1" 
                              rules={[{ required: true, message: 'Nhập URL hình ảnh' }]}
                            >
                              <Input placeholder="https://.../image.jpg" />
                            </Form.Item>
                            <Button danger size="small" className="min-w-[120px]" onClick={() => remove(name)}>Xóa URL</Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Phương thức thanh toán</Text>} name="paymentMethodsSelection" rules={[{ required: true, message: 'Chọn ít nhất 1 phương thức' }]}> 
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
        </Card>

        <Card 
          title={<Title level={4} className="mb-0"><SettingOutlined className="mr-2" />Sức chứa & AI</Title>} 
          size="small"
          className="shadow-sm"
        >
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Form.Item label={<Text strong>Sức chứa - Dịch vụ đồng thời</Text>} name="capacityMaxConcurrentServices" rules={[{ required: true }]}> 
                <Input type="number" placeholder="15" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<Text strong>Sức chứa - Lịch/ngày</Text>} name="capacityMaxDailyAppointments" rules={[{ required: true }]}> 
                <Input type="number" placeholder="80" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[12, 12]}>
            <Col span={8}>
              <Form.Item label={<Text strong>Dự đoán tồn kho</Text>} name="ai_enableInventoryPrediction" valuePropName="checked"> 
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Dự đoán bảo trì</Text>} name="ai_enableMaintenancePrediction" valuePropName="checked"> 
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={<Text strong>Dự báo nhu cầu</Text>} name="ai_enableDemandForecasting" valuePropName="checked"> 
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
        </Card>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} size="small" className="min-w-[120px]">Hủy</Button>
          <Button type="primary" size="small" htmlType="submit" loading={loading} className="min-w-[120px]"> 
            {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ServiceCenterForm;
