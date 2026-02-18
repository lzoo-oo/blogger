import { useEffect, useState } from 'react';
import { Empty, Spin } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { getFriendLinks } from '../../api';

interface FriendLink {
  id: number;
  name: string;
  link_url: string;
  logo_url: string;
  description: string;
}

export default function FriendLinks() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await getFriendLinks();
      setLinks(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="front-page-stack">
      <section className="glass-panel section-panel">
        <h2>友情链接</h2>
        <p className="muted">与优秀站点互链，交流创作与技术。</p>
      </section>

      {!links.length ? (
        <div className="glass-panel section-panel">
          <Empty description="暂无友情链接" />
        </div>
      ) : (
        <section className="friend-grid">
          {links.map((link) => (
            <a
              href={link.link_url}
              target="_blank"
              rel="noreferrer"
              className="friend-card glass-panel"
              key={link.id}
            >
              {link.logo_url ? <img src={link.logo_url} alt={link.name} /> : <div className="friend-icon"><LinkOutlined /></div>}
              <h3>{link.name}</h3>
              <p>{link.description || link.link_url}</p>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
