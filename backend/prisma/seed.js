import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'ecotester@carbonix.ai' },
    update: {},
    create: {
      name: 'Demo Eco Explorer',
      email: 'ecotester@carbonix.ai',
      passwordHash,
      location: 'San Francisco',
      role: 'USER'
    }
  });

  console.log(`👤 User ready: ${user.email} (${user.id})`);

  // Check if activities already exist
  const existingActivities = await prisma.activity.count({ where: { userId: user.id } });
  if (existingActivities === 0) {
    const sampleActivities = [
      {
        userId: user.id,
        category: 'electricity',
        activityType: 'grid_electricity',
        quantity: 180,
        unit: 'kWh',
        emissionFactor: 0.47,
        carbonEmission: 84.6,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        category: 'transport',
        activityType: 'petrol_car',
        quantity: 45,
        unit: 'km',
        emissionFactor: 0.192,
        carbonEmission: 8.64,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        category: 'food',
        activityType: 'meat_medium',
        quantity: 1,
        unit: 'day',
        emissionFactor: 5.63,
        carbonEmission: 5.63,
        date: new Date()
      },
      {
        userId: user.id,
        category: 'transport',
        activityType: 'electric_car',
        quantity: 25,
        unit: 'km',
        emissionFactor: 0.053,
        carbonEmission: 1.32,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        category: 'electricity',
        activityType: 'grid_electricity',
        quantity: 210,
        unit: 'kWh',
        emissionFactor: 0.47,
        carbonEmission: 98.7,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const act of sampleActivities) {
      await prisma.activity.create({ data: act });
    }
    console.log(`✅ Seeded ${sampleActivities.length} sample activities.`);
  }

  // Check if goals exist
  const existingGoals = await prisma.goal.count({ where: { userId: user.id } });
  if (existingGoals === 0) {
    const sampleGoals = [
      {
        userId: user.id,
        title: 'Cut Home Energy by 20%',
        targetEmission: 70.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS'
      },
      {
        userId: user.id,
        title: 'Transit & Micro-mobility Shift',
        targetEmission: 5.0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'IN_PROGRESS'
      }
    ];

    for (const g of sampleGoals) {
      await prisma.goal.create({ data: g });
    }
    console.log(`✅ Seeded ${sampleGoals.length} sample goals.`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
