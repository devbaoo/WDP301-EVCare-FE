import { Form, Input, InputNumber, Select, Switch, Button, Divider, Space } from "antd";

const { Option } = Select;

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
  aiData?: string;
}

export default function ServiceTypeForm({ form }: { form: any }) {
  return (
    <Form layout="vertical" form={form} preserve={false}>
      <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
        <Input placeholder="Ví dụ: Thay pin" />
      </Form.Item>
      <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Nhập mô tả" }]}>
        <Input.TextArea rows={3} placeholder="Mô tả ngắn" />
      </Form.Item>
      <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: "Chọn danh mục" }]}>
        <Select placeholder="Chọn danh mục">
          <Option value="maintenance">Maintenance</Option>
          <Option value="repair">Repair</Option>
          <Option value="upgrade">Upgrade</Option>
          <Option value="inspection">Inspection</Option>
          <Option value="emergency">Emergency</Option>
        </Select>
      </Form.Item>

      <Divider>Pricing</Divider>
      <Space direction="vertical" className="w-full">
        <Form.Item name="basePrice" label="Giá cơ bản (VND)" rules={[{ required: true, message: "Nhập giá" }]}>
          <InputNumber min={0} step={1000} className="w-full" />
        </Form.Item>
        <Form.Item name="priceType" label="Loại giá" initialValue="fixed">
          <Select>
            <Option value="fixed">Fixed</Option>
            <Option value="range">Range</Option>
            <Option value="hourly">Hourly</Option>
          </Select>
        </Form.Item>
        <Form.Item name="currency" label="Tiền tệ" initialValue="VND">
          <Input placeholder="VND" />
        </Form.Item>
        <Form.Item name="isNegotiable" label="Có thương lượng" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>

      <Divider>Service Details</Divider>
      <Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true, message: "Nhập thời lượng" }]}>
        <InputNumber min={0} step={5} className="w-full" />
      </Form.Item>
      <Form.Item name="complexity" label="Độ khó" initialValue="easy" rules={[{ required: true }]}>
        <Select>
          <Option value="easy">Easy</Option>
          <Option value="medium">Medium</Option>
          <Option value="hard">Hard</Option>
        </Select>
      </Form.Item>
      <Form.List name="requiredSkills">
        {(fields, { add, remove }) => (
          <div>
            <div className="flex items-center justify-between"><span>Required Skills</span><Button type="link" onClick={() => add()}>Thêm</Button></div>
            {fields.map((field) => (
              <Space key={field.key} className="w-full mb-2">
                <Form.Item {...field} name={[field.name]} className="w-full" rules={[{ required: true, message: "Nhập skill" }]}>
                  <Input placeholder="e.g. battery management" />
                </Form.Item>
                <Button danger onClick={() => remove(field.name)}>Xóa</Button>
              </Space>
            ))}
          </div>
        )}
      </Form.List>
      <Form.List name="tools">
        {(fields, { add, remove }) => (
          <div>
            <div className="flex items-center justify-between"><span>Tools</span><Button type="link" onClick={() => add()}>Thêm</Button></div>
            {fields.map((field) => (
              <Space key={field.key} className="w-full mb-2">
                <Form.Item {...field} name={[field.name]} className="w-full" rules={[{ required: true, message: "Nhập tool" }]}>
                  <Input placeholder="e.g. hydraulic lift" />
                </Form.Item>
                <Button danger onClick={() => remove(field.name)}>Xóa</Button>
              </Space>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>Required Parts</Divider>
      <Form.List name="requiredParts">
        {(fields, { add, remove }) => (
          <div>
            <Button type="dashed" onClick={() => add()} className="mb-2">Thêm linh kiện</Button>
            {fields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <Form.Item name={[field.name, "partName"]} label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "partType"]} label="Loại" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "quantity"]} label="Số lượng" initialValue={1}><InputNumber min={0} className="w-full" /></Form.Item>
                <Form.Item name={[field.name, "estimatedCost"]} label="Giá ước tính"><InputNumber min={0} step={1000} className="w-full" /></Form.Item>
                <Form.Item name={[field.name, "isOptional"]} label="Tùy chọn" valuePropName="checked"><Switch /></Form.Item>
                <div className="flex items-end"><Button danger onClick={() => remove(field.name)}>Xóa</Button></div>
              </div>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>Compatible Vehicles</Divider>
      <Form.List name="compatibleVehicles">
        {(fields, { add, remove }) => (
          <div>
            <Button type="dashed" onClick={() => add()} className="mb-2">Thêm xe tương thích</Button>
            {fields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <Form.Item name={[field.name, "brand"]} label="Hãng" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "model"]} label="Model" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "year"]} label="Năm" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "batteryType"]} label="Loại pin"><Input /></Form.Item>
                <div className="flex items-end"><Button danger onClick={() => remove(field.name)}>Xóa</Button></div>
              </div>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>Procedure</Divider>
      <Form.List name="steps">
        {(fields, { add, remove }) => (
          <div>
            <Button type="dashed" onClick={() => add()} className="mb-2">Thêm bước</Button>
            {fields.map((field, idx) => (
              <div key={field.key} className="border rounded p-3 mb-3">
                <Form.Item name={[field.name, "stepNumber"]} label="Số bước" initialValue={idx + 1}><InputNumber min={1} className="w-full" /></Form.Item>
                <Form.Item name={[field.name, "title"]} label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "description"]} label="Mô tả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
                <Form.Item name={[field.name, "estimatedTime"]} label="Thời gian (phút)"><InputNumber min={0} className="w-full" /></Form.Item>
                <Form.Item name={[field.name, "requiredTools"]} label="Dụng cụ (cách nhau dấu phẩy)"><Input /></Form.Item>
                <Form.Item name={[field.name, "safetyNotes"]} label="Lưu ý an toàn (cách nhau dấu phẩy)"><Input /></Form.Item>
                <div className="flex justify-end"><Button danger onClick={() => remove(field.name)}>Xóa bước</Button></div>
              </div>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>Requirements</Divider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Form.Item name="minBatteryLevel" label="Mức pin tối thiểu (%)"><InputNumber min={0} max={100} className="w-full" /></Form.Item>
        <Form.Item name="maxMileage" label="Odo tối đa (km)"><InputNumber min={0} className="w-full" /></Form.Item>
      </div>
      <Form.List name="specialConditions">
        {(fields, { add, remove }) => (
          <div>
            <div className="flex items-center justify-between"><span>Điều kiện đặc biệt</span><Button type="link" onClick={() => add()}>Thêm</Button></div>
            {fields.map((field) => (
              <Space key={field.key} className="w-full mb-2">
                <Form.Item {...field} name={[field.name]} className="w-full"><Input /></Form.Item>
                <Button danger onClick={() => remove(field.name)}>Xóa</Button>
              </Space>
            ))}
          </div>
        )}
      </Form.List>
      <Form.List name="safetyRequirements">
        {(fields, { add, remove }) => (
          <div>
            <div className="flex items-center justify-between"><span>Yêu cầu an toàn</span><Button type="link" onClick={() => add()}>Thêm</Button></div>
            {fields.map((field) => (
              <Space key={field.key} className="w-full mb-2">
                <Form.Item {...field} name={[field.name]} className="w-full"><Input /></Form.Item>
                <Button danger onClick={() => remove(field.name)}>Xóa</Button>
              </Space>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>Trạng thái & Tags</Divider>
      <Form.Item name="status" label="Trạng thái" initialValue="active" rules={[{ required: true }]}>
        <Select>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Form.Item>
      <Form.List name="tags">
        {(fields, { add, remove }) => (
          <div>
            <div className="flex items-center justify-between"><span>Tags</span><Button type="link" onClick={() => add()}>Thêm</Button></div>
            {fields.map((field) => (
              <Space key={field.key} className="w-full mb-2">
                <Form.Item {...field} name={[field.name]} className="w-full"><Input placeholder="tag" /></Form.Item>
                <Button danger onClick={() => remove(field.name)}>Xóa</Button>
              </Space>
            ))}
          </div>
        )}
      </Form.List>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Form.Item name="priority" label="Ưu tiên"><InputNumber min={0} className="w-full" /></Form.Item>
        <Form.Item name="isPopular" label="Phổ biến" valuePropName="checked"><Switch /></Form.Item>
      </div>

      <Divider>Hình ảnh</Divider>
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <div>
            <Button type="dashed" onClick={() => add()} className="mb-2">Thêm ảnh</Button>
            {fields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <Form.Item name={[field.name, "url"]} label="URL" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name={[field.name, "caption"]} label="Chú thích"><Input /></Form.Item>
                <Form.Item name={[field.name, "isPrimary"]} label="Ảnh chính" valuePropName="checked"><Switch /></Form.Item>
                <div className="flex items-end"><Button danger onClick={() => remove(field.name)}>Xóa</Button></div>
              </div>
            ))}
          </div>
        )}
      </Form.List>

      <Divider>AI Data (JSON)</Divider>
      <Form.Item name="aiData" label="Dữ liệu AI (JSON)">
        <Input.TextArea rows={4} placeholder='{"averageCompletionTime": 175, ...}' />
      </Form.Item>
    </Form>
  );
}


