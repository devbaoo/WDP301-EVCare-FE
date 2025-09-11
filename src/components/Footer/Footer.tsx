import {  Typography, Row, Col, Card } from 'antd';
import { PlayCircleOutlined, FireOutlined, TrophyOutlined } from '@ant-design/icons';
const Footer = () => {
    return (
              <div className="mt-16">
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          Vì sao chọn Quizlingo?
        </Typography.Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card bordered hoverable>
              <FireOutlined style={{ fontSize: '36px', color: '#fa541c' }} />
              <Typography.Title level={4}>Bài học tương tác</Typography.Title>
              <Typography.Paragraph>
                Các câu hỏi thú vị giúp bạn nhớ từ vựng và ngữ pháp lâu hơn qua trò chơi tương tác.
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered hoverable>
              <TrophyOutlined style={{ fontSize: '36px', color: '#1890ff' }} />
              <Typography.Title level={4}>Theo dõi tiến độ</Typography.Title>
              <Typography.Paragraph>
                Giao diện rõ ràng, theo dõi thành tích học tập, huy hiệu, và bảng xếp hạng.
              </Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered hoverable>
              <PlayCircleOutlined style={{ fontSize: '36px', color: '#52c41a' }} />
              <Typography.Title level={4}>Học mọi lúc mọi nơi</Typography.Title>
              <Typography.Paragraph>
                Ứng dụng học mọi nơi trên máy tính hoặc điện thoại – mọi thời điểm bạn muốn.
              </Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    );
}

export default Footer;