const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/sahamDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const transactionSchema = new mongoose.Schema({
  stockName: String,
  quantity: Number,
  price: Number,
  description: String,
  date: { type: Date, default: Date.now },
});
const Transaction = mongoose.model('Transaction', transactionSchema);

app.post('/marketplace', async (req, res) => {
  try {
    const { stockName, quantity, price, description } = req.body;
    const transaction = new Transaction({
      stockName,
      quantity,
      price,
      description,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/marketplace', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { stockName } = req.query;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query = {};

    if (stockName) {
      query.stockName = stockName;
    }

    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    const transactions = await Transaction.find(query)
      .limit(limit)
      .skip(startIndex);

    const paginationInfo = {
      page_number: page,
      page_size: limit,
      count: transactions.length,
      total_pages: totalPages,
      has_previous_page: page > 1,
      has_next_page: endIndex < totalTransactions,
      data: transactions,
    };

    res.json(paginationInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/marketplace/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stockName, quantity, price, description } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { stockName, quantity, price, description },
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/marketplace/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server runs at port ${port} in development environment`);
});
