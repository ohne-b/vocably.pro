import { getPaddleInstance } from '@paddle/paddle-js';
import { environment } from '../environments/environment';

export type SubscriptionInterval = 'month' | 'year';

export type SubscriptionProduct = {
  priceId: string;
  interval: SubscriptionInterval;
  perMonth: string;
  total: string;
  maxTotal: string;
  title: string;
  trialDays: number;
};

const subscriptionProducts: SubscriptionProduct[] = [
  {
    priceId: environment.paddleMonthlyPriceId,
    interval: 'month',
    perMonth: '$4.99',
    total: '$4.99',
    maxTotal: '',
    title: 'Monthly premium',
    trialDays: 3,
  },
  {
    priceId: environment.paddleYearlyPriceId,
    interval: 'year',
    perMonth: '$2.50',
    total: '$29.99',
    maxTotal: '$59.88',
    title: 'Yearly premium',
    trialDays: 7,
  },
];

export const getSubscriptionProducts = async (): Promise<
  SubscriptionProduct[]
> => {
  const Paddle = getPaddleInstance();
  if (!Paddle) {
    return subscriptionProducts;
  }

  const { data } = await Paddle.PricePreview({
    items: subscriptionProducts.map((product) => ({
      priceId: product.priceId,
      quantity: 1,
    })),
  });

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: data.currencyCode,
  });

  // Use the line item totals (the amount the customer is actually charged)
  // for every calculation. `price.unitPrice` is the base catalog amount and
  // doesn't match the charged price, which produces inconsistent numbers.
  const monthlyAmount = Number(data.details.lineItems[0].totals.total);

  data.details.lineItems.forEach((item, index) => {
    const product = subscriptionProducts[index];
    const totalAmount = Number(item.totals.total);
    product.total = formatter.format(totalAmount / 100);
    if (item.price.trialPeriod) {
      product.trialDays = item.price.trialPeriod.frequency;
    }

    if (product.interval === 'month') {
      product.perMonth = product.total;
    }

    if (product.interval === 'year') {
      product.maxTotal = formatter.format((monthlyAmount * 12) / 100);
      product.perMonth = formatter.format(Math.round(totalAmount / 12) / 100);
    }
  });

  return subscriptionProducts;
};
