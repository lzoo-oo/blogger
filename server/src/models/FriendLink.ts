import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

interface FriendLinkAttributes {
  id: number;
  name: string;
  link_url: string;
  logo_url: string;
}

interface FriendLinkCreationAttributes extends Omit<FriendLinkAttributes, 'id'> {}

class FriendLink extends Model<FriendLinkAttributes, FriendLinkCreationAttributes> implements FriendLinkAttributes {
  public id!: number;
  public name!: string;
  public link_url!: string;
  public logo_url!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

FriendLink.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    link_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    logo_url: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    }
  },
  {
    sequelize,
    modelName: 'FriendLink',
    tableName: 'friend_links'
  }
);

export default FriendLink;
