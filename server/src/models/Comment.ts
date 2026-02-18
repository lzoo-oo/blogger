import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

interface CommentAttributes {
  id: number;
  nickname: string;
  email: string;
  content: string;
  article_id: number;
  parent_id: number | null;
  is_admin: boolean;
}

interface CommentCreationAttributes extends Omit<CommentAttributes, 'id'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public nickname!: string;
  public email!: string;
  public content!: string;
  public article_id!: number;
  public parent_id!: number | null;
  public is_admin!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    article_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments'
  }
);

export default Comment;
