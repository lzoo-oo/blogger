import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

interface CategoryAttributes {
  id: number;
  name: string;
  alias: string;
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public alias!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Category.init(
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
    alias: {
      type: DataTypes.STRING(50),
      defaultValue: ''
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
  }
);

export default Category;
