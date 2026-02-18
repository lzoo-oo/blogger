import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/db';

interface ArticleAttributes {
  id: number;
  title: string;
  content: string;
  cover_img: string;
  summary: string;
  view_count: number;
  like_count: number;
  is_top: boolean;
  status: number;
  cate_id: number;
}

interface ArticleCreationAttributes extends Omit<ArticleAttributes, 'id'> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public cover_img!: string;
  public summary!: string;
  public view_count!: number;
  public like_count!: number;
  public is_top!: boolean;
  public status!: number;
  public cate_id!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    cover_img: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    summary: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_top: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '1:发布 0:草稿'
    },
    cate_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Article',
    tableName: 'articles'
  }
);

export default Article;
