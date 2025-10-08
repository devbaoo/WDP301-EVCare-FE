import { Form, Input, InputNumber, Select, Switch, Button, Card, Row, Col, Typography } from "antd";
import { 
  FileTextOutlined, 
  DollarOutlined, 
  SettingOutlined, 
  CarOutlined, 
  TagsOutlined, 
  PlusOutlined,
  DeleteOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

export interface ServiceTypeFormValues {
  name: string;
  description: string;
  category: "maintenance" | "repair" | "inspection" | "upgrade" | "emergency";
  serviceDetails: {
    minTechnicians: number;
    maxTechnicians: number;
  };
  pricing: {
  basePrice: number;
    priceType: "fixed" | "hourly" | "per_km" | "custom";
    currency: string;
    isNegotiable: boolean;
  };
  compatibleVehicles: Array<{
    brand: string;
    model: string;
    year?: string;
    batteryType?: string;
  }>;
  status: "active" | "inactive" | "maintenance";
  isPopular: boolean;
}

export default function ServiceTypeForm({ form }: { form: any }) {
  return (
    <div className="w-full max-h-[70vh] overflow-y-auto">
      <Form layout="vertical" form={form} preserve={false} className="space-y-4">
        {/* Basic Information */}
        <Card 
          title={<Title level={4} className="mb-0"><FileTextOutlined className="mr-2" />Thông tin cơ bản</Title>} 
          className="shadow-sm mb-4"
          size="small"
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="name" 
                label={<Text strong>Tên dịch vụ</Text>} 
                rules={[{ required: true, message: "Nhập tên dịch vụ" }]}
              >
                <Input placeholder="Ví dụ: Thay pin xe điện" />
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="category" 
                label={<Text strong>Danh mục</Text>} 
                rules={[{ required: true, message: "Chọn danh mục" }]}
              >
        <Select placeholder="Chọn danh mục">
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="repair">Sửa chữa</Option>
                  <Option value="upgrade">Nâng cấp</Option>
                  <Option value="inspection">Kiểm tra</Option>
                  <Option value="emergency">Khẩn cấp</Option>
        </Select>
      </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item 
                name="description" 
                label={<Text strong>Mô tả dịch vụ</Text>} 
                rules={[{ required: true, message: "Nhập mô tả" }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Mô tả chi tiết về dịch vụ..." 
                  showCount 
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Pricing Information */}
        <Card 
          title={<Title level={4} className="mb-0"><DollarOutlined className="mr-2" />Thông tin giá cả</Title>} 
          className="shadow-sm mb-4"
          size="small"
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["pricing", "basePrice"]}
                label={<Text strong>Giá cơ bản (VND)</Text>} 
                rules={[{ required: true, message: "Nhập giá" }]}
              >
                <InputNumber 
                  min={0} 
                  step={1000} 
                  className="w-full" 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
        </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["pricing", "priceType"]}
                label={<Text strong>Loại giá</Text>} 
                initialValue="fixed"
              >
          <Select>
                  <Option value="fixed">Cố định</Option>
                  <Option value="hourly">Theo giờ</Option>
                  <Option value="per_km">Theo km</Option>
                  <Option value="custom">Tùy chỉnh</Option>
          </Select>
        </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["pricing", "currency"]}
                label={<Text strong>Tiền tệ</Text>} 
                initialValue="VND"
              >
          <Input placeholder="VND" />
        </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item 
                name={["pricing", "isNegotiable"]}
                label={<Text strong>Có thể thương lượng giá</Text>} 
                valuePropName="checked"
                initialValue={false}
              >
                <Switch size="default" />
        </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Technician Requirements */}
        <Card 
          title={<Title level={4} className="mb-0"><SettingOutlined className="mr-2" />Yêu cầu kỹ thuật viên</Title>}
          className="shadow-sm mb-4"
          size="small"
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["serviceDetails", "minTechnicians"]}
                label={<Text strong>Số kỹ thuật viên tối thiểu</Text>}
                rules={[{ required: true, message: "Nhập số kỹ thuật viên tối thiểu" }]}
                initialValue={1}
              >
                <InputNumber 
                  min={1}
                  className="w-full" 
                  placeholder="Ví dụ: 1"
                />
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["serviceDetails", "maxTechnicians"]}
                label={<Text strong>Số kỹ thuật viên tối đa</Text>}
                rules={[{ required: true, message: "Nhập số kỹ thuật viên tối đa" }]}
                initialValue={1}
              >
                <InputNumber 
                  min={1} 
                  className="w-full" 
                  placeholder="Ví dụ: 3"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>



        {/* Compatible Vehicles */}
        <Card title={<Title level={4} className="mb-0"><CarOutlined className="mr-2" />Xe tương thích</Title>} className="shadow-sm mb-4" size="small">
      <Form.List name="compatibleVehicles">
        {(fields, { add, remove }) => (
          <div>
                <div className="flex justify-between items-center mb-4">
                  <Text type="secondary">Thêm các loại xe có thể sử dụng dịch vụ này</Text>
                  <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                    Thêm xe tương thích
                  </Button>
                </div>
            {fields.map((field) => (
                  <Card key={field.key} size="small" className="mb-3 border-dashed">
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item 
                          name={[field.name, "brand"]} 
                          label={<Text strong>Hãng xe</Text>} 
                          rules={[{ required: true, message: "Nhập hãng xe" }]}
                        >
                          <Input placeholder="Ví dụ: Tesla, VinFast" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item 
                          name={[field.name, "model"]} 
                          label={<Text strong>Model</Text>} 
                          rules={[{ required: true, message: "Nhập model" }]}
                        >
                          <Input placeholder="Ví dụ: Model 3, VF8" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item 
                          name={[field.name, "year"]} 
                          label={<Text strong>Năm sản xuất</Text>} 
                          rules={[{ required: true, message: "Nhập năm" }]}
                        >
                          <Input placeholder="Ví dụ: 2023" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item 
                          name={[field.name, "batteryType"]} 
                          label={<Text strong>Loại pin</Text>}
                        >
                          <Input placeholder="Ví dụ: Li-ion, LFP" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} className="flex justify-end">
                        <Button 
                          danger 
                          size="small"
                          onClick={() => remove(field.name)}
                          className="min-w-[120px]"
                        >
                          <DeleteOutlined /> Xóa xe
                        </Button>
                      </Col>
                    </Row>
                  </Card>
            ))}
          </div>
        )}
      </Form.List>
        </Card>



        {/* Status & Tags */}
        <Card title={<Title level={4} className="mb-0"><TagsOutlined className="mr-2" />Trạng thái & Thẻ</Title>} className="shadow-sm mb-4" size="small">
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="status" 
                label={<Text strong>Trạng thái dịch vụ</Text>} 
                initialValue="active" 
                rules={[{ required: true }]}
              >
        <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Tạm dừng</Option>
                  <Option value="maintenance">Bảo trì</Option>
        </Select>
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="isPopular" 
                label={<Text strong>Dịch vụ phổ biến</Text>} 
                valuePropName="checked"
                initialValue={false}
              >
                <Switch size="default" />
              </Form.Item>
            </Col>
          </Row>
          
        </Card>


    </Form>
    </div>
  );
}


