import db from '../../lib/database.js';
import { v4 as uuidv4 } from 'uuid';

// Demo data for Kenyan Property Management System
export const seedDemoData = async () => {
  console.log('🌱 Seeding demo data...');

  try {
    // Create demo user
    const demoUser = {
      id: uuidv4(),
      email: 'demo@renteasy.co.ke',
      full_name: 'Demo Landlord',
      password_hash: 'demo_password_hash',
      phone: '+254 712 345 678',
      role: 'landlord'
    };

    const [user] = await db('users').insert(demoUser).returning('*');
    console.log('✅ Demo user created:', user.email);

    // Create demo properties
    const properties = [
      {
        id: uuidv4(),
        owner_id: user.id,
        name: 'Kilimani Heights Apartments',
        address: 'Ngong Road, Kilimani',
        city: 'Nairobi',
        county: 'Nairobi County',
        postal_code: '00100',
        property_type: 'apartment',
        units_count: 12,
        bedrooms: 2,
        bathrooms: 1,
        square_feet: 850,
        year_built: 2019,
        monthly_rent: 45000,
        description: 'Modern apartment complex in prime Kilimani location with secure parking and backup water.',
        status: 'occupied',
        images: ['https://via.placeholder.com/400x300?text=Kilimani+Apt'],
        amenities: ['Secure Parking', 'Backup Water', 'Gym', '24/7 Security']
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        name: 'Westlands Bungalow',
        address: 'Waiyaki Way, Westlands',
        city: 'Nairobi',
        county: 'Nairobi County',
        postal_code: '00800',
        property_type: 'bungalow',
        units_count: 1,
        bedrooms: 4,
        bathrooms: 3,
        square_feet: 2400,
        year_built: 2015,
        monthly_rent: 85000,
        description: 'Spacious 4-bedroom bungalow with garden and servant quarters.',
        status: 'occupied',
        images: ['https://via.placeholder.com/400x300?text=Westlands+Bungalow'],
        amenities: ['Garden', 'Servant Quarters', 'Gated Community', 'Play Area']
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        name: 'Karen Townhouse',
        address: 'Karen Road, Karen',
        city: 'Nairobi',
        county: 'Nairobi County',
        postal_code: '00502',
        property_type: 'townhouse',
        units_count: 1,
        bedrooms: 3,
        bathrooms: 2.5,
        square_feet: 1800,
        year_built: 2020,
        monthly_rent: 65000,
        description: 'Modern townhouse in exclusive Karen area with great views.',
        status: 'available',
        images: ['https://via.placeholder.com/400x300?text=Karen+Townhouse'],
        amenities: ['Mountain Views', 'Private Garden', 'DSQ', 'Solar Water Heating']
      }
    ];

    await db('properties').insert(properties);
    console.log(`✅ ${properties.length} properties created`);

    // Create demo tenants
    const tenants = [
      {
        id: uuidv4(),
        owner_id: user.id,
        property_id: properties[0].id,
        first_name: 'John',
        last_name: 'Mwangi',
        email: 'john.mwangi@email.com',
        phone: '+254 723 456 789',
        id_number: '12345678',
        emergency_contact_name: 'Mary Mwangi',
        emergency_contact_phone: '+254 723 456 790',
        lease_start_date: '2024-01-01',
        lease_end_date: '2024-12-31',
        monthly_rent: 45000,
        security_deposit: 90000,
        status: 'active'
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        property_id: properties[1].id,
        first_name: 'Grace',
        last_name: 'Ochieng',
        email: 'grace.ochieng@email.com',
        phone: '+254 734 567 890',
        id_number: '87654321',
        emergency_contact_name: 'David Ochieng',
        emergency_contact_phone: '+254 734 567 891',
        lease_start_date: '2024-02-01',
        lease_end_date: '2025-01-31',
        monthly_rent: 85000,
        security_deposit: 170000,
        status: 'active'
      }
    ];

    await db('tenants').insert(tenants);
    console.log(`✅ ${tenants.length} tenants created`);

    // Create demo payments
    const payments = [
      // Current year payments
      ...['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'].map((month, index) => ({
        id: uuidv4(),
        owner_id: user.id,
        tenant_id: tenants[0].id,
        property_id: properties[0].id,
        amount: 45000,
        due_date: `${month}-01`,
        paid_date: index < 5 ? `${month}-05` : null,
        payment_method: index < 5 ? 'bank_transfer' : null,
        payment_type: 'rent',
        status: index < 5 ? 'paid' : 'pending'
      })),
      ...['2024-02', '2024-03', '2024-04', '2024-05', '2024-06'].map((month, index) => ({
        id: uuidv4(),
        owner_id: user.id,
        tenant_id: tenants[1].id,
        property_id: properties[1].id,
        amount: 85000,
        due_date: `${month}-01`,
        paid_date: index < 4 ? `${month}-03` : null,
        payment_method: index < 4 ? 'bank_transfer' : null,
        payment_type: 'rent',
        status: index < 4 ? 'paid' : 'pending'
      })),
      // Security deposits
      {
        id: uuidv4(),
        owner_id: user.id,
        tenant_id: tenants[0].id,
        property_id: properties[0].id,
        amount: 90000,
        due_date: '2024-01-01',
        paid_date: '2024-01-01',
        payment_method: 'bank_transfer',
        payment_type: 'deposit',
        status: 'paid'
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        tenant_id: tenants[1].id,
        property_id: properties[1].id,
        amount: 170000,
        due_date: '2024-02-01',
        paid_date: '2024-02-01',
        payment_method: 'bank_transfer',
        payment_type: 'deposit',
        status: 'paid'
      }
    ];

    await db('payments').insert(payments);
    console.log(`✅ ${payments.length} payments created`);

    // Create demo maintenance requests
    const maintenanceRequests = [
      {
        id: uuidv4(),
        owner_id: user.id,
        property_id: properties[0].id,
        tenant_id: tenants[0].id,
        title: 'Leaking Kitchen Sink',
        description: 'Kitchen sink is leaking and needs to be repaired urgently.',
        priority: 'medium',
        status: 'completed',
        assigned_to: 'Plumber Services Ltd',
        cost: 2500,
        completion_date: '2024-05-15'
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        property_id: properties[1].id,
        tenant_id: tenants[1].id,
        title: 'AC Not Working',
        description: 'Air conditioning unit in master bedroom not cooling properly.',
        priority: 'high',
        status: 'in_progress',
        assigned_to: 'CoolTech Solutions',
        cost: null,
        completion_date: null
      },
      {
        id: uuidv4(),
        owner_id: user.id,
        property_id: properties[0].id,
        tenant_id: tenants[0].id,
        title: 'Gate Remote Not Working',
        description: 'Main gate remote control needs replacement.',
        priority: 'low',
        status: 'open',
        assigned_to: null,
        cost: null,
        completion_date: null
      }
    ];

    await db('maintenance_requests').insert(maintenanceRequests);
    console.log(`✅ ${maintenanceRequests.length} maintenance requests created`);

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('📧 Login with: demo@renteasy.co.ke');
    console.log('🔑 Password: demo_password_hash');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
