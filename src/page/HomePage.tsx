import { Button, Typography, Row, Col } from 'antd';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header Section */}
      <Header />


      {/* Main Content Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <img
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHNpNXR2bmM2aW01ZDE0dzF5eXkwc3BvZnc0OTQ4eDlod3d5djdrZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H4j6zA8T1dfLHcCueu/giphy.gif"
          alt="Quizlingo mascot"
          className="w-48 h-48 mx-auto"
        />

        <Typography.Title level={2} style={{ color: '#1677ff' }}>
          Quizlingo
        </Typography.Title>

        <Typography.Title level={4}>
          Cách học ngôn ngữ miễn phí, vui nhộn và hiệu quả!
        </Typography.Title>

        <Row gutter={[16, 16]} justify="center" className="mt-4">
          <Col>
            <Button type="primary" size="large" style={{ backgroundColor: '#1677ff', borderColor: '#1677ff' }}>
              Bắt đầu
            </Button>
          </Col>
          <Col>
            <Button size="large">Tôi đã có tài khoản</Button>
          </Col>
        </Row>
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default HomePage;