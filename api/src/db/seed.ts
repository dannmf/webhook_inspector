import { db } from './index'
import { webhooks } from './schema'
import { faker } from '@faker-js/faker'

const stripeEventTypes = [
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
  'payout.created',
  'payout.paid',
  'payout.failed',
]

function generateStripeWebhookBody(eventType: string) {
  const baseEvent = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: faker.date.recent({ days: 30 }).getTime() / 1000,
    type: eventType,
    livemode: faker.datatype.boolean(),
  }

  if (eventType.startsWith('payment_intent.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `pi_${faker.string.alphanumeric(24)}`,
          object: 'payment_intent',
          amount: faker.number.int({ min: 1000, max: 50000 }),
          currency: 'usd',
          status: eventType.includes('succeeded')
            ? 'succeeded'
            : eventType.includes('failed')
              ? 'requires_payment_method'
              : 'requires_confirmation',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          description: faker.commerce.productName(),
          metadata: {
            order_id: faker.string.uuid(),
          },
        },
      },
    }
  }

  if (eventType.startsWith('charge.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `ch_${faker.string.alphanumeric(24)}`,
          object: 'charge',
          amount: faker.number.int({ min: 1000, max: 50000 }),
          currency: 'usd',
          status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          receipt_email: faker.internet.email(),
          refunded: eventType.includes('refunded'),
        },
      },
    }
  }

  if (eventType.startsWith('customer.subscription.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `sub_${faker.string.alphanumeric(14)}`,
          object: 'subscription',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          status: faker.helpers.arrayElement([
            'active',
            'trialing',
            'past_due',
            'canceled',
          ]),
          current_period_start: faker.date.recent({ days: 30 }).getTime() / 1000,
          current_period_end: faker.date.future({ years: 1 }).getTime() / 1000,
          plan: {
            id: `plan_${faker.string.alphanumeric(14)}`,
            amount: faker.number.int({ min: 999, max: 9999 }),
            currency: 'usd',
            interval: faker.helpers.arrayElement(['month', 'year']),
          },
        },
      },
    }
  }

  if (eventType.startsWith('customer.') && !eventType.includes('subscription')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cus_${faker.string.alphanumeric(14)}`,
          object: 'customer',
          email: faker.internet.email(),
          name: faker.person.fullName(),
          phone: faker.phone.number(),
          address: {
            city: faker.location.city(),
            country: faker.location.countryCode(),
            line1: faker.location.streetAddress(),
            postal_code: faker.location.zipCode(),
            state: faker.location.state(),
          },
        },
      },
    }
  }

  if (eventType.startsWith('invoice.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `in_${faker.string.alphanumeric(24)}`,
          object: 'invoice',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          subscription: `sub_${faker.string.alphanumeric(14)}`,
          amount_due: faker.number.int({ min: 1000, max: 50000 }),
          amount_paid: eventType.includes('paid')
            ? faker.number.int({ min: 1000, max: 50000 })
            : 0,
          currency: 'usd',
          status: eventType.includes('paid')
            ? 'paid'
            : eventType.includes('failed')
              ? 'open'
              : 'draft',
          hosted_invoice_url: faker.internet.url(),
        },
      },
    }
  }

  if (eventType.startsWith('checkout.session.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `cs_${faker.string.alphanumeric(24)}`,
          object: 'checkout.session',
          amount_total: faker.number.int({ min: 1000, max: 50000 }),
          currency: 'usd',
          customer: `cus_${faker.string.alphanumeric(14)}`,
          payment_status: eventType.includes('completed') ? 'paid' : 'unpaid',
          status: eventType.includes('completed') ? 'complete' : 'expired',
          success_url: faker.internet.url(),
          cancel_url: faker.internet.url(),
        },
      },
    }
  }

  if (eventType.startsWith('payment_method.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `pm_${faker.string.alphanumeric(24)}`,
          object: 'payment_method',
          type: 'card',
          card: {
            brand: faker.helpers.arrayElement([
              'visa',
              'mastercard',
              'amex',
              'discover',
            ]),
            last4: faker.finance.creditCardNumber().slice(-4),
            exp_month: faker.number.int({ min: 1, max: 12 }),
            exp_year: faker.number.int({ min: 2024, max: 2030 }),
          },
          customer: `cus_${faker.string.alphanumeric(14)}`,
        },
      },
    }
  }

  if (eventType.startsWith('payout.')) {
    return {
      ...baseEvent,
      data: {
        object: {
          id: `po_${faker.string.alphanumeric(24)}`,
          object: 'payout',
          amount: faker.number.int({ min: 10000, max: 100000 }),
          currency: 'usd',
          status: eventType.includes('paid')
            ? 'paid'
            : eventType.includes('failed')
              ? 'failed'
              : 'in_transit',
          arrival_date: faker.date.future({ years: 1 }).getTime() / 1000,
          description: `STRIPE PAYOUT`,
        },
      },
    }
  }

  return {
    ...baseEvent,
    data: {
      object: {
        id: faker.string.alphanumeric(24),
      },
    },
  }
}

function generateStripeHeaders() {
  return {
    'content-type': 'application/json',
    'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.hexadecimal({ length: 64, prefix: '' })}`,
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate',
    'x-stripe-webhook-id': `wh_${faker.string.alphanumeric(24)}`,
  }
}

async function seed() {
  console.log('Iniciando seed do banco de dados...')

  const webhooksData = []

  for (let i = 0; i < 65; i++) {
    const eventType = faker.helpers.arrayElement(stripeEventTypes)
    const body = generateStripeWebhookBody(eventType)
    const headers = generateStripeHeaders()
    const createdAt = faker.date.recent({ days: 30 })

    webhooksData.push({
      method: 'POST',
      pathname: '/webhooks/stripe',
      ip: faker.internet.ipv4(),
      statusCode: faker.helpers.weightedArrayElement([
        { value: 200, weight: 85 },
        { value: 400, weight: 5 },
        { value: 401, weight: 5 },
        { value: 500, weight: 5 },
      ]),
      contentType: 'application/json',
      contentLength: JSON.stringify(body).length,
      queryParams: faker.datatype.boolean(0.2)
        ? { source: faker.helpers.arrayElement(['webhook', 'test', 'manual']) }
        : null,
      headers: headers,
      body: JSON.stringify(body, null, 2),
      createdAt: createdAt,
    })
  }

  webhooksData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  await db.insert(webhooks).values(webhooksData)

  console.log(`Seed concluido! ${webhooksData.length} webhooks criados.`)
}

seed()
  .then(() => {
    console.log('Seed executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
