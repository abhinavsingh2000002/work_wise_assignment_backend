import { Sequelize, DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.PG_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    connectTimeout: 60000,
  },
});

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Define the User model
class User extends Model {
  // Method to check if password matches
  async isPasswordMatch(password) {
    return bcrypt.compare(password, this.password);
  }

  // Generate access token
  async generateAccessToken() {
    const accessToken = jwt.sign({ _id: this.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
    });
    this.accessToken = accessToken;
    return accessToken;
  }

  // Generate refresh token
  async generateRefreshToken() {
    const refreshToken = jwt.sign({ _id: this.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    });
    this.refreshToken = refreshToken;
    return refreshToken;
  }

  async isValidPassword(password) {
    return await bcrypt.compare(password, this.password); // Assuming `this.password` is hashed
  }
}

// Initialize User model schema
User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
    },
    access_token: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Set default to current date
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Set default to current date
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users', // The table name in PostgreSQL
    timestamps: false,  // Enable automatic createdAt and updatedAt fields
  }
);

// Hook to hash the password before saving
User.beforeSave(async (user, options) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;
