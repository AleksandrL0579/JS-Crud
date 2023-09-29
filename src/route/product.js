// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// // ================================================================

class Product {
  static #list = []

  constructor(name, price, description) {
    this.name = name
    this.price = price
    this.description = description
    this.id = Math.floor(Math.random() * 100000)
  }

  static getList() {
    return this.#list
  }

  static add(product) {
    this.#list.push(product)
  }

  static getById = (id) => {
    return this.#list.find((product) => product.id === id)
  }

  static deleteById(id) {
    const index = this.#list.findIndex(
      (product) => product.id === id,
    )

    if (index !== -1) {
      this.#list.splice(index, 1)
      return true
    } else {
      return false
    }
  }

  static verifyId(product, id) {
    // console.log("Id check: ", product.id, id )
    return product.id === id
  }

  static updateById(id, data) {
    const product = this.getById(id)

    if (product) {
      this.update(product, data)
    }
  }

  static update(product, { name, price, description }) {
    if (name && price && description) {
      product.name = name
      product.price = price
      product.description = description
    }
  }
}

// ================================================================

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/product-create', function (req, res) {
  // res.render генерує нам HTML сторінку

  const list = Product.getList()

  res.render('product-create', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'product-create',
    data: {
      products: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.post('/product-create', function (req, res) {
  const { name, price, description } = req.body

  const product = new Product(name, price, description)

  Product.add(product)

  console.log(Product.getList())

  res.render('product-alert', {
    style: 'product-alert',
    info: 'Товар добавлен в список',
  })
})

// ================================================================

router.get('/product-list', function (req, res) {
  const list = Product.getList()

  res.render('product-list', {
    style: 'product-list',
    data: {
      products: {
        list,
        isEmpty: list.length === 0,
      },
    },
  })
})

// ================================================================

router.post('/product-edit', function (req, res) {
  const { name, price, description, id } = req.body

  const product = Product.getById(Number(id))

  if (product) {
    if (Product.verifyId(product, Number(id))) {
      Product.update(product, { name, price, description })

      res.render('product-alert', {
        style: 'product-alert',
        info: 'Продукт обновлен',
      })
    }
  } else {
    res.render('product-alert', {
      style: 'product-alert',
      info: 'Товар з таким ID не найдено',
    })
  }
})

// ================================================================

router.get('/product-edit', function (req, res) {
  const { id } = req.query

  const product = Product.getById(Number(id))

  res.render('product-edit', {
    style: 'product-edit',
    data: {
      name: product.name,
      price: product.price,
      description: product.description,
      id: product.id,
    },
  })
})

// ================================================================

router.get('/product-delete', function (req, res) {
  const { id } = req.query

  Product.deleteById(Number(id))

  res.render('product-alert', {
    style: 'product-alert',
    info: 'Продукт удален',
  })
})

// Підключаємо роутер до бек-енду
module.exports = router
