const { Router } = require('express');
const router = Router();
const Order = require('../models/order');
const auth = require('../middleware/auth.js');

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id })
      .populate('user.userId')
      .lean();

    res.render('orders', {
      title: 'Заказы',
      isOrder: true,
      orders: orders.map(o => ({
        ...o,
        price: o.courses.reduce(
          (total, c) => (total += c.count * c.course.price),
          0
        ),
      })),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();

    const courses = user.cart.items.map(i => ({
      count: i.count,
      course: { ...i.courseId._doc },
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect('/orders');
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
