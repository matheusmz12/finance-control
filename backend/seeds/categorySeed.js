import Category from "../models/Category.js";

async function seedCategories() {
  const categories = [
    {
      name: "Salário",
      type: "ENTRADA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Freelance",
      type: "ENTRADA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Investimentos",
      type: "ENTRADA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Alimentação",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Transporte",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Moradia",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Contas",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Lazer",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Saúde",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Educação",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
    {
      name: "Outros",
      type: "SAIDA",
      userId: null,
      isDefault: true,
    },
  ];


for (const category of categories) {
  const exists = await Category.findOne({
    where: {
      name: category.name,
      isDefault: true
    }
  });

  if (exists) {
    continue;
  }

  await Category.create(category);
}

  console.log("Categorias padrão criadas!");
}

seedCategories();

//colocar as seeds novamente
// node seeds/categorySeed.js