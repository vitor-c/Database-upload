import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }
    // eslint-disable-next-line prefer-const
    let categoryData = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryData) {
      categoryData = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryData);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryData,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
