import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/db';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  email: string;
  role: string;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public nickname!: string;
  public avatar!: string;
  public email!: string;
  public role!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    email: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'admin'
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  }
);

export default User;
