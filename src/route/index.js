// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// // ================================================================

// class Purchase {}
class Product {
  static #list = []

  static #count = 0

  constructor(
    img,
    title,
    description,
    category,
    price,
    amount = 0,
  ) {
    this.id = ++Product.#count
    this.img = img
    this.title = title
    this.category = category
    this.description = description
    this.price = price
    this.amount = amount
    // this.id = Math.floor(Math.random() * 100000)
  }
  static add = (...data) => {
    const newProduct = new Product(...data)
    this.#list.push(newProduct)
  }
  static getList = () => {
    return this.#list
  }
  static getById = (id) => {
    return this.#list.find((product) => product.id === id)
  }
  static getRandomList = (id) => {
    const filteredList = this.#list.filter(
      (product) => product.id !== id,
    )

    const shuffledList = filteredList.sort(
      () => Math.random() - 0.5,
    )
    return shuffledList.slice(0, 3)
  }
}
Product.add(
  'https://picsum.photos/200/300',
  'Компьютер Article Gaming',
  'AMD Ryzen-5',
  [
    { id: 1, text: 'Готовый к отправке' },
    { id: 2, text: 'Топ продаж' },
  ],
  20000,
  10,
)
Product.add(
  'https://picsum.photos/200/300',
  'Компьютер Proline Article Gaming',
  'AMD Ryzen-5',
  [{ id: 1, text: 'Готовый к отправке' }],
  25000,
  10,
)
Product.add(
  'https://picsum.photos/200/300',
  'Компьютер Business Article Gaming',
  'AMD Ryzen-5',
  [{ id: 2, text: 'Топ продаж' }],
  30000,
  10,
)
class Purchase {
  static DELIVERY_PRICE = 150
  static #BONUS_FACTOR = 0.1

  static #count = 0
  static #list = []

  static #bonusAccount = new Map()

  static getBonusBalance = (email) => {
    return Purchase.#bonusAccount.get(email) || 0
  }

  static calcBonusAmount = (value) => {
    return value * Purchase.#BONUS_FACTOR
  }

  static updateBonusBalance = (
    email,
    price,
    bonusUse = 0,
  ) => {
    const amount = this.calcBonusAmount(price) //Purchase.calcBonusAmount(price)
    const currentBalance = Purchase.getBonusBalance(email)
    const updateBalance = currentBalance + amount - bonusUse
    Purchase.#bonusAccount.set(email, updateBalance)

    // console.log(email, updateBalance)

    return amount
  }

  constructor(data, product) {
    this.id = ++Purchase.#count
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.phone = data.phone
    this.email = data.email
    this.comment = data.comment || null
    this.bonus = data.bonus || 0
    this.promocode = data.promocode || null
    this.totalPrice = data.totalPrice
    this.productPrice = data.productPrice
    this.deliveryPrice = data.deliveryPrice
    this.amount = data.amount
    this.product = product
  }

  static add = (...arg) => {
    const newPurchase = new Purchase(...arg)
    this.#list.push(newPurchase)
    return newPurchase
  }

  static getList = () => {
    // return Purchase.#list.reverse()
    return Purchase.#list.reverse().map((item) => ({
      id: item.id,
      totalPrice: item.totalPrice,
      bonus: item.bonus,
      product: item.product.title,
    }))
  }

  static getById = (id) => {
    return Purchase.#list.find((item) => item.id === id)
  }

  static updateById = (id, data) => {
    const purchase = Purchase.getById(id)
    if (purchase) {
      if (data.firstname)
        purchase.firstname = data.firstname
      if (data.lastname) purchase.lastname = data.lastname
      if (data.phone) purchase.phone = data.phone
      if (data.email) purchase.email = data.email
      return true
    } else {
      return false
    }
  }
}

//=======================================================================

class Promocode {
  static #list = []

  constructor(name, factor) {
    this.name = name
    this.factor = factor
  }

  static add = (name, factor) => {
    const newPromoCode = new Promocode(name, factor)
    Promocode.#list.push(newPromoCode)
    return newPromoCode
  }

  static getByName = (name) => {
    return this.#list.find((promo) => promo.name === name)
  }

  static calc = (promo, price) => {
    return price * promo.factor
  }
}

Promocode.add('SUMMER2023', 0.9)
Promocode.add('DISCOUNT50', 0.5)
Promocode.add('SALE25', 0.75)

//==================================================================
router.get('/', function (req, res) {
  res.render('purchase-index', {
    style: 'purchase-index',
    data: {
      list: Product.getList(),
    },
  })
})
//=================================================================
router.get('/purchase-product', function (req, res) {
  const id = Number(req.query.id)
  res.render('purchase-product', {
    style: 'purchase-product',
    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
})
//====================================================================
router.post('/purchase-create', function (req, res) {
  const id = Number(req.query.id)
  const amount = Number(req.body.amount)

  if (amount < 1) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Некорректное количество товара',
        link: `/purchase-product?id=${id}`,
      },
    })
  }
  const product = Product.getById(id)

  if (amount < 1) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Такого количества товара нет в наявности',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  const productPrice = product.price * amount
  const totalPrice = productPrice + Purchase.DELIVERY_PRICE
  const bonus = Purchase.calcBonusAmount(totalPrice)
  //======================================================================
  res.render('purchase-create', {
    style: 'purchase-create',
    data: {
      id: product.id,
      cart: [
        {
          text: `${product.title} (${amount} шт)`,
          price: productPrice,
        },
        {
          text: 'Доставка',
          price: Purchase.DELIVERY_PRICE,
        },
      ],
      totalPrice,
      productPrice,
      deliveryPrice: Purchase.DELIVERY_PRICE,
      amount,
      bonus,
    },
  })
})
//==================================================================
router.post('/purchase-submit', function (req, res) {
  const id = Number(req.query.id)

  let {
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,
    firstname,
    lastname,
    phone,
    email,
    comment,
    promocode,
    bonus,
  } = req.body

  // console.log('bonus1:', bonus)
  // let correctBonus = bonus[1]
  // console.log('newBonus:', correctBonus)
  // bonus = correctBonus
  // console.log('bonus2:', bonus)

  const product = Product.getById(id)

  if (!product) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Товар не найден',
        link: '/purchase-list',
      },
    })
  }

  if (product.amount < amount) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Товара нет в нужном количестве',
        link: '/purchase-list',
      },
    })
  }

  totalPrice = Number(totalPrice)
  productPrice = Number(productPrice)
  deliveryPrice = Number(deliveryPrice)
  amount = Number(amount)
  bonus = Number(bonus)

  // console.log('bonus3:', bonus)

  if (
    isNaN(totalPrice) ||
    isNaN(productPrice) ||
    isNaN(deliveryPrice) ||
    isNaN(amount) ||
    isNaN(bonus)
  ) {
    // console.log('bonusNaN', bonus)

    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Некоректные данные',
        link: '/purchase-list',
      },
    })
  }
  if (!firstname || !lastname || !phone || !email) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message:
          'Заполните обязательные поля, обозначенные *',
        info: 'Некоректные данные',
        // link: `/purchase-product?id=${id}`,
        link: '/purchase-list',
      },
    })
  }

  if (bonus || bonus > 0) {
    const bonusAmount = Purchase.getBonusBalance(email)

    // console.log('bonusAmount', bonusAmount)

    if (bonus > bonusAmount) {
      bonus = bonusAmount //====
      // console.log('bonus5:', bonus)
    }
    Purchase.updateBonusBalance(email, totalPrice, bonus)
    totalPrice -= bonus
  } else {
    Purchase.updateBonusBalance(email, totalPrice, 0)
  }

  if (promocode) {
    promocode = Promocode.getByName(promocode)
    if (promocode) {
      totalPrice = Promocode.calc(promocode, totalPrice)
    }
  }

  if (totalPrice < 0) totalPrice = 0
  const purchase = Purchase.add(
    {
      firstname,
      lastname,
      phone,
      email,
      comment,
      promocode,
      totalPrice,
      productPrice,
      deliveryPrice,
      amount,
      bonus,
    },
    product,
  )

  console.log(purchase)

  // console.log(req.query)
  // console.log(req.body)
  //==================================================================
  res.render('alert', {
    style: 'alert',
    data: {
      message: 'Успешно',
      info: 'Заказ создан',
      link: '/purchase-list',
    },
  })
})
// ================================================================

router.get('/purchase-list', function (req, res) {
  const list = Purchase.getList()
  // console.log(list)

  res.render('purchase-list', {
    style: 'purchase-list',
    list,
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================
//=================================

router.get('/purchase-info', function (req, res) {
  const id = Number(req.query.id)
  const purchaseInfo = Purchase.getById(id)

  // console.log(purchaseInfo)

  res.render('purchase-info', {
    style: 'purchase-info',
    purchaseInfo,
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.get('/purchase-update', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)

  if (!purchase) {
    res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Заказ с таким ID не найден',
        link: '/purchase-list',
      },
    })
  } else {
    res.render('purchase-update', {
      style: 'purchase-update',
      data: {
        id: purchase.id,
        firstname: purchase.firstname,
        lastname: purchase.lastname,
        phone: purchase.phone,
        email: purchase.email,
      },
    })
  }
  // ↑↑ сюди вводимо JSON дані
})

// ===============================================================

router.post('/purchase-update', function (req, res) {
  const id = Number(req.query.id)
  let { firstname, lastname, phone, email } = req.body

  const purchase = Purchase.getById(id)

  // console.log(purchase)

  if (purchase) {
    const newPurchase = Purchase.updateById(id, {
      firstname,
      lastname,
      phone,
      email,
    })

    if (newPurchase) {
      res.render('alert', {
        style: 'alert',

        data: {
          message: 'Успешное исполнение действия',
          info: 'Информация о заказе обновлена',
          link: `/purchase-info?id=${purchase.id}`,
        },
      })
    } else {
      res.render('alert', {
        style: 'alert',

        data: {
          message: 'Ошибка',
          info: 'Информация о заказе обновлена',
          link: `/purchase-info?id=${purchase.id}`,
        },
      })
    }
  } else {
    res.render('alert', {
      style: 'alert',

      data: {
        message: 'Ошибка',
        info: 'Данный заказ не найден',
        link: '/purchase-list',
      },
    })
  }
})
// Підключаємо роутер до бек-енду
module.exports = router
