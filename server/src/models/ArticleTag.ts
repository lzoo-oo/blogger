import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

interface ArticleTagAttributes {
  articleId: number;
  tagId: number;
}

class ArticleTag extends Model<ArticleTagAttributes> implements ArticleTagAttributes {
  public articleId!: number;
  public tagId!: number;
}

ArticleTag.init(
  {
    articleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'article_id'
    },
    tagId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'tag_id'
    }
  },
  {
    sequelize,
    modelName: 'ArticleTag',
    tableName: 'article_tags',
    timestamps: false
  }
);

export default ArticleTag;
