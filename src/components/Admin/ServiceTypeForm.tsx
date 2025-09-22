import { Form, Input, InputNumber, Select, Switch, Button, Card, Row, Col, Typography } from "antd";
import { 
  FileTextOutlined, 
  DollarOutlined, 
  SettingOutlined, 
  ToolOutlined, 
  CarOutlined, 
  OrderedListOutlined, 
  SafetyOutlined, 
  TagsOutlined, 
  PictureOutlined, 
  RobotOutlined,
  PlusOutlined,
  DeleteOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

export interface ServiceTypeFormValues {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType?: string;
  currency?: string;
  isNegotiable?: boolean;
  duration: number;
  complexity: "easy" | "medium" | "hard";
  requiredSkills?: string[];
  tools?: string[];
  requiredParts?: Array<{ partName: string; partType: string; quantity?: number; isOptional?: boolean; estimatedCost?: number }>;
  compatibleVehicles?: Array<{ brand: string; model: string; year: string | number; batteryType?: string }>;
  steps?: Array<{ stepNumber?: number; title: string; description: string; estimatedTime?: number; requiredTools?: string; safetyNotes?: string }>;
  minBatteryLevel?: number;
  maxMileage?: number;
  specialConditions?: string[];
  safetyRequirements?: string[];
  status: "active" | "inactive";
  tags?: string[];
  priority?: number;
  isPopular?: boolean;
  images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>;
  aiData?: {
    averageCompletionTime?: number;
    successRate?: number;
    commonIssues?: string[];
    recommendations?: string[];
  };
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
                name="basePrice" 
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
                name="priceType" 
                label={<Text strong>Loại giá</Text>} 
                initialValue="fixed"
              >
          <Select>
                  <Option value="fixed">Cố định</Option>
                  <Option value="range">Khoảng giá</Option>
                  <Option value="hourly">Theo giờ</Option>
          </Select>
        </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="currency" 
                label={<Text strong>Tiền tệ</Text>} 
                initialValue="VND"
              >
          <Input placeholder="VND" />
        </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item 
                name="isNegotiable" 
                label={<Text strong>Có thể thương lượng giá</Text>} 
                valuePropName="checked"
              >
                <Switch size="default" />
        </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Service Details */}
        <Card 
          title={<Title level={4} className="mb-0"><SettingOutlined className="mr-2" />Chi tiết dịch vụ</Title>} 
          className="shadow-sm mb-4"
          size="small"
        >
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="duration" 
                label={<Text strong>Thời lượng (phút)</Text>} 
                rules={[{ required: true, message: "Nhập thời lượng" }]}
              >
                <InputNumber 
                  min={0} 
                  step={5} 
                  className="w-full" 
                  placeholder="Ví dụ: 120"
                />
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="complexity" 
                label={<Text strong>Độ khó</Text>} 
                initialValue="easy" 
                rules={[{ required: true }]}
              >
        <Select>
                  <Option value="easy">Dễ</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="hard">Khó</Option>
        </Select>
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="priority" 
                label={<Text strong>Mức độ ưu tiên</Text>}
              >
                <InputNumber 
                  min={1} 
                  max={10} 
                  className="w-full" 
                  size="large"
                  placeholder="1-10"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Skills & Tools */}
        <Card title={<Title level={4} className="mb-0"><ToolOutlined className="mr-2" />Kỹ năng & Dụng cụ</Title>} className="shadow-sm mb-4" size="small">
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={8} lg={6}>
      <Form.List name="requiredSkills">
        {(fields, { add, remove }) => (
          <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Kỹ năng yêu cầu</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                        Thêm kỹ năng
                      </Button>
                    </div>
            {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0" 
                          rules={[{ required: true, message: "Nhập kỹ năng" }]}
                        >
                          <Input placeholder="Ví dụ: Quản lý pin, Điện tử ô tô" />
                </Form.Item>
                      <Button 
                        danger 
                        size="small" 
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                        className="min-w-[120px]"
                      >
                        Xóa kỹ năng 
                      </Button>
                      </div>
            ))}
          </div>
        )}
      </Form.List>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
      <Form.List name="tools">
        {(fields, { add, remove }) => (
          <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Dụng cụ cần thiết</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                        Thêm dụng cụ
                      </Button>
                    </div>
            {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0" 
                          rules={[{ required: true, message: "Nhập dụng cụ" }]}
                        >
                          <Input placeholder="Ví dụ: Cầu nâng thủy lực, Đồng hồ đo điện" />
                </Form.Item>
                      <Button 
                          danger 
                          size="small" 
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                        className="min-w-[120px]"
                      >
                        Xóa dụng cụ
                      </Button>
                      </div>
            ))}
          </div>
        )}
      </Form.List>
            </Col>
          </Row>
        </Card>

        {/* Required Parts */}
        <Card title={<Title level={4} className="mb-0"><ToolOutlined className="mr-2" />Linh kiện cần thiết</Title>} className="shadow-sm mb-4" size="small">
      <Form.List name="requiredParts">
        {(fields, { add, remove }) => (
          <div>
                <div className="flex justify-between items-center mb-4">
                  <Text type="secondary">Thêm các linh kiện cần thiết cho dịch vụ</Text>
                  <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                    Thêm linh kiện
                  </Button>
                </div>
            {fields.map((field) => (
                  <Card key={field.key} size="small" className="mb-3 border-dashed">
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "partName"]} 
                          label={<Text strong>Tên linh kiện</Text>} 
                          rules={[{ required: true, message: "Nhập tên linh kiện" }]}
                        >
                          <Input placeholder="Ví dụ: Pin lithium-ion" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "partType"]} 
                          label={<Text strong>Loại linh kiện</Text>} 
                          rules={[{ required: true, message: "Nhập loại linh kiện" }]}
                        >
                          <Input placeholder="Ví dụ: Pin, Dây điện, Cảm biến" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "quantity"]} 
                          label={<Text strong>Số lượng</Text>} 
                          initialValue={1}
                        >
                          <InputNumber min={0} className="w-full" placeholder="1" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "estimatedCost"]} 
                          label={<Text strong>Giá ước tính (VND)</Text>}
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
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "isOptional"]} 
                          label={<Text strong>Linh kiện tùy chọn</Text>} 
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8} className="flex items-end justify-end">
                        <Button 
                          danger 
                          size="small"
                          onClick={() => remove(field.name)}
                          className="min-w-[120px]"
                        >
                          <DeleteOutlined /> Xóa linh kiện
                        </Button>
                      </Col>
                    </Row>
                  </Card>
            ))}
          </div>
        )}
      </Form.List>
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

        {/* Procedure Steps */}
        <Card title={<Title level={4} className="mb-0"><OrderedListOutlined className="mr-2" />Quy trình thực hiện</Title>} className="shadow-sm mb-4" size="small">
      <Form.List name="steps">
        {(fields, { add, remove }) => (
          <div>
                <div className="flex justify-between items-center mb-4">
                  <Text type="secondary">Thêm các bước thực hiện dịch vụ</Text>
                  <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />}>
                    Thêm bước
                  </Button>
                </div>
            {fields.map((field, idx) => (
                  <Card key={field.key} size="small" className="mb-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-center mb-3">
                      <Text strong className="text-blue-600">Bước {idx + 1}</Text>
                      <Button 
                        danger 
                        size="small" 
                        onClick={() => remove(field.name)}
                        className="min-w-[120px]"
                      >
                        <DeleteOutlined /> Xóa bước
                      </Button>
              </div>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item 
                          name={[field.name, "stepNumber"]} 
                          label={<Text strong>Số thứ tự</Text>} 
                          initialValue={idx + 1}
                        >
                          <InputNumber min={1} className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={18}>
                        <Form.Item 
                          name={[field.name, "title"]} 
                          label={<Text strong>Tiêu đề bước</Text>} 
                          rules={[{ required: true, message: "Nhập tiêu đề" }]}
                        >
                          <Input placeholder="Ví dụ: Kiểm tra tình trạng pin" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item 
                          name={[field.name, "description"]} 
                          label={<Text strong>Mô tả chi tiết</Text>} 
                          rules={[{ required: true, message: "Nhập mô tả" }]}
                        >
                          <Input.TextArea 
                            rows={2} 
                            placeholder="Mô tả chi tiết các bước thực hiện..."
                            showCount
                            maxLength={300}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "estimatedTime"]} 
                          label={<Text strong>Thời gian ước tính (phút)</Text>}
                        >
                          <InputNumber min={0} className="w-full" placeholder="30" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "requiredTools"]} 
                          label={<Text strong>Dụng cụ cần thiết</Text>}
                        >
                          <Input placeholder="Cách nhau bằng dấu phẩy" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item 
                          name={[field.name, "safetyNotes"]} 
                          label={<Text strong>Lưu ý an toàn</Text>}
                        >
                          <Input placeholder="Cách nhau bằng dấu phẩy" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
            ))}
          </div>
        )}
      </Form.List>
        </Card>

        {/* Requirements */}
        <Card title={<Title level={4} className="mb-0"><SafetyOutlined className="mr-2" />Yêu cầu & Điều kiện</Title>} className="shadow-sm mb-4" size="small">
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="minBatteryLevel" 
                label={<Text strong>Mức pin tối thiểu (%)</Text>}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  className="w-full" 
                  size="large"
                  placeholder="Ví dụ: 20"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name="maxMileage" 
                label={<Text strong>Odo tối đa (km)</Text>}
              >
                <InputNumber 
                  min={0} 
                  className="w-full" 
                  size="large"
                  placeholder="Ví dụ: 100000"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={8} lg={6}>
      <Form.List name="specialConditions">
        {(fields, { add, remove }) => (
          <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Điều kiện đặc biệt</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />}>
                        Thêm điều kiện
                      </Button>
                    </div>
            {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0"
                        >
                          <Input placeholder="Ví dụ: Xe phải được sạc đầy trước khi thực hiện" />
                        </Form.Item>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => remove(field.name)}
                          icon={<DeleteOutlined />}
                          className="min-w-[120px]"
                        >
                          Xóa điều kiện
                        </Button>
                      </div>
            ))}
          </div>
        )}
      </Form.List>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
      <Form.List name="safetyRequirements">
        {(fields, { add, remove }) => (
          <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Yêu cầu an toàn</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                        Thêm yêu cầu
                      </Button>
                    </div>
            {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0"
                        >
                          <Input placeholder="Ví dụ: Mang găng tay cách điện" />
                        </Form.Item>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => remove(field.name)}
                          icon={<DeleteOutlined />}
                          className="min-w-[120px]"
                        >
                          Xóa yêu cầu
                        </Button>
                      </div>
            ))}
          </div>
        )}
      </Form.List>
            </Col>
          </Row>
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
        </Select>
      </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="isPopular" 
                label={<Text strong>Dịch vụ phổ biến</Text>} 
                valuePropName="checked"
              >
                <Switch size="default" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="priority" 
                label={<Text strong>Mức độ ưu tiên</Text>}
              >
                <InputNumber 
                  min={1} 
                  max={10} 
                  className="w-full" 
                  size="large"
                  placeholder="1-10"
                />
              </Form.Item>
            </Col>
          </Row>
          
      <Form.List name="tags">
        {(fields, { add, remove }) => (
          <div>
                <div className="flex items-center justify-between mb-4">
                  <Text strong>Thẻ phân loại</Text>
                  <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                    Thêm thẻ
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
            {fields.map((field) => (
                    <div key={field.key} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <Form.Item 
                        {...field} 
                        name={[field.name]} 
                        className="mb-0"
                      >
                        <Input 
                          placeholder="Ví dụ: pin, sửa chữa" 
                          size="small"
                          style={{ width: 150 }}
                        />
                      </Form.Item>
                      <Button 
                        danger 
                        size="small" 
                        onClick={() => remove(field.name)}
                      >
                        <DeleteOutlined />
                      </Button>

                    </div>
                  ))}
                </div>
          </div>
        )}
      </Form.List>
        </Card>

        {/* Images */}
        <Card title={<Title level={4} className="mb-0"><PictureOutlined className="mr-2" />Hình ảnh dịch vụ</Title>} className="shadow-sm mb-4" size="small">
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <div>
                <div className="flex justify-between items-center mb-4">
                  <Text type="secondary">Thêm hình ảnh minh họa cho dịch vụ</Text>
                  <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                    Thêm ảnh
                  </Button>
                </div>
            {fields.map((field) => (
                  <Card key={field.key} size="small" className="mb-3 border-dashed">
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item 
                          name={[field.name, "url"]} 
                          label={<Text strong>URL hình ảnh</Text>} 
                          rules={[{ required: true, message: "Nhập URL" }]}
                        >
                          <Input placeholder="https://example.com/image.jpg" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item 
                          name={[field.name, "caption"]} 
                          label={<Text strong>Chú thích</Text>}
                        >
                          <Input placeholder="Mô tả ngắn về hình ảnh" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={12}>
                        <Form.Item 
                          name={[field.name, "isPrimary"]} 
                          label={<Text strong>Ảnh chính</Text>} 
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12} className="flex items-end justify-end">
                        <Button 
                          danger 
                          size="small"
                          onClick={() => remove(field.name)}
                          className="min-w-[120px]"
                        >
                          <DeleteOutlined /> Xóa ảnh
                        </Button>
                      </Col>
                    </Row>
                  </Card>
            ))}
          </div>
        )}
      </Form.List>
        </Card>

        {/* AI Data */}
        <Card title={<Title level={4} className="mb-0"><RobotOutlined className="mr-2" />Dữ liệu AI</Title>} className="shadow-sm mb-4" size="small">
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["aiData", "averageCompletionTime"]} 
                label={<Text strong>Thời gian hoàn thành trung bình (phút)</Text>}
              >
                <InputNumber 
                  min={0} 
                  className="w-full" 
                  size="large"
                  placeholder="Ví dụ: 175"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item 
                name={["aiData", "successRate"]} 
                label={<Text strong>Tỷ lệ thành công (%)</Text>}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  className="w-full" 
                  size="large"
                  placeholder="Ví dụ: 95"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.List name={["aiData", "commonIssues"]}>
        {(fields, { add, remove }) => (
          <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Vấn đề thường gặp</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                        Thêm vấn đề
                      </Button>
                    </div>
            {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0"
                        >
                          <Input placeholder="Ví dụ: Pin không tương thích" />
                        </Form.Item>
                      <Button 
                        danger 
                        size="small" 
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                        className="min-w-[120px]"
                      >
                        Xóa
                      </Button>
              </div>
            ))}
          </div>
        )}
      </Form.List>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.List name={["aiData", "recommendations"]}>
                {(fields, { add, remove }) => (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text strong>Khuyến nghị</Text>
                      <Button type="primary" size="small" onClick={() => add()} icon={<PlusOutlined />} className="min-w-[120px]">
                        Thêm khuyến nghị
                      </Button>
                    </div>
                    {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-2 mb-2">
                        <Form.Item 
                          {...field} 
                          name={[field.name]} 
                          className="flex-1 mb-0"
                        >
                          <Input placeholder="Ví dụ: Kiểm tra module BMS trước khi thay" />
      </Form.Item>
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => remove(field.name)}
                          icon={<DeleteOutlined />}
                          className="min-w-[120px]"
                        >
                          Xóa
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Form.List>
            </Col>
          </Row>
        </Card>
    </Form>
    </div>
  );
}


