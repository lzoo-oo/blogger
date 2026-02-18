import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Card, message, Spin, Upload } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getArticleDetail, addArticle, updateArticle, getCategories, getTags, uploadImage } from '../../api';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');

  useEffect(() => {
    loadCategories();
    loadTags();
    if (id) {
      loadArticle();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadTags = async () => {
    try {
      const res = await getTags();
      setTags(res.data || []);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await getArticleDetail(Number(id));
      const article = res.data;
      form.setFieldsValue({
        title: article.title,
        summary: article.summary,
        cate_id: article.cate_id,
        tag_ids: article.tags?.map((t: Tag) => t.id) || [],
        status: article.status,
      });
      setContent(article.content || '');
      setCover(article.cover_img || '');
    } catch (error) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const data = {
        ...values,
        content,
        cover_img: cover,
      };

      if (id) {
        await updateArticle(Number(id), data);
        message.success('更新成功');
      } else {
        await addArticle(data);
        message.success('创建成功');
      }
      navigate('/admin/articles');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadImage(file);
      setCover(res.data.url);
      return false;
    } catch (error) {
      message.error('上传失败');
      return false;
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/articles')}>
          返回列表
        </Button>
      </div>

      <Card title={id ? '编辑文章' : '新增文章'}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={3} placeholder="请输入文章摘要" />
          </Form.Item>

          <Form.Item label="封面">
            {cover && (
              <img src={cover} alt="cover" style={{ maxWidth: 200, marginBottom: 8 }} />
            )}
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<PlusOutlined />}>上传封面</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="cate_id" label="分类">
            <Select placeholder="请选择分类" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="tag_ids" label="标签">
            <Select mode="multiple" placeholder="请选择标签">
              {tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.id}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="内容">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              style={{ height: 400, marginBottom: 50 }}
            />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>发布</Select.Option>
              <Select.Option value={0}>草稿</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
