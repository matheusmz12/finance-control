import User from "./User.js"
import Category from "./Category.js"
import Transaction from "./Transaction.js"


User.hasMany(Category,{
    foreignKey:"userId"
})

Category.belongsTo(User, {
    foreignKey:"userId"
})

User.hasMany(Transaction, {
    foreignKey: "userId"
});
Transaction.belongsTo(User, {
    foreignKey:"userId"
});

Category.hasMany(Transaction, {
    foreignKey:"categoryId"
});
Transaction.belongsTo(Category, {
    foreignKey:"categoryId"
});

export{
    User,
    Category,
    Transaction
}