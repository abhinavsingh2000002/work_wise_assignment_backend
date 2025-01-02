import { Sequelize, DataTypes, Model } from 'sequelize';

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

// Define the Booking model
class Booking extends Model {
    // You can add methods here if needed
}

// Initialize Booking model schema
Booking.init(
    {
        seat_no: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW, // Automatically update on modification
        },
    },
    {
        sequelize,
        modelName: 'Booking',
        tableName: 'bookings', // The table name in PostgreSQL
        timestamps: false,  // Disable automatic createdAt and updatedAt fields
    }
);

// Export the model
export default Booking;
