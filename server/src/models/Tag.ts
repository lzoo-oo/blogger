import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

interface TagAttributes {
  id: number;
  name: string;
}

interface TagCreationAttributes extends Omit<TagAttributes, 'id'> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public name!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Tag',
    tableName: 'tags'
  }
);

export default Tag;
