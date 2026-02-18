// 模型关联配置
import User from './User';
import Article from './Article';
import Category from './Category';
import Tag from './Tag';
import ArticleTag from './ArticleTag';
import Comment from './Comment';
import FriendLink from './FriendLink';

// 文章属于分类
Article.belongsTo(Category, { foreignKey: 'cate_id', as: 'category' });
Category.hasMany(Article, { foreignKey: 'cate_id', as: 'articles' });

// 文章和标签多对多关系
Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'articleId',
  otherKey: 'tagId',
  as: 'tags'
});
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tagId',
  otherKey: 'articleId',
  as: 'articles'
});

// 文章和评论一对多
Article.hasMany(Comment, { foreignKey: 'article_id', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'article_id', as: 'article' });

// 评论自关联（盖楼回复）
Comment.hasMany(Comment, {
  foreignKey: 'parent_id',
  as: 'replies'
});
Comment.belongsTo(Comment, {
  foreignKey: 'parent_id',
  as: 'parent'
});

export {
  User,
  Article,
  Category,
  Tag,
  ArticleTag,
  Comment,
  FriendLink
};
