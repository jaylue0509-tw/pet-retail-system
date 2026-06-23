import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <section className="hero">
        <h1>讓每一個生命都被溫柔以待</h1>
        <p>東森寵物聯合全台 108 間實體門市，為毛孩尋找最溫暖的家。</p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/stores" className="btn btn-primary">尋找門市毛孩 (狗狗/喵喵)</Link>
          <Link to="/stores" className="btn" style={{ marginLeft: '1rem', background: 'transparent', border: '1px solid var(--primary-dark)', color: 'var(--primary-dark)' }}>查看全台門市</Link>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>最新消息與亮點</h2>
        <div className="grid">
          <div className="card">
            <div className="card-content">
              <div className="badge">平台更新</div>
              <h3 className="card-title">108間門市全面啟動</h3>
              <p className="card-text">現在您可以透過本平台，即時查詢全台108間門市目前狗狗與喵喵尋找主人的最新資訊。</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content">
              <div className="badge">尋家須知</div>
              <h3 className="card-title">帶我回家評估</h3>
              <p className="card-text">這是一輩子的承諾。請確保您已準備好時間、空間與經濟能力，給牠一個真正的家。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
