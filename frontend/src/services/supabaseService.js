import { supabase } from '../utils/supabaseClient';

export const fetchResidents = async () => {
  const { data, error } = await supabase
    .from('residents')
    .select(`
      resident_id,
      household_id,
      family_id,
      first_name,
      last_name,
      middle_name,
      extension_name,
      date_of_birth,
      sex,
      civil_status,
      citizenship,
      occupation,
      blood_type,
      religion,
      contact_number,
      email,
      is_active,
      created_at
    `)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching residents:', error);
    return [];
  }

  // Transform data to match existing mockData format so frontend components don't break immediately
  return data.map(r => ({
    residentId: r.resident_id,
    householdId: r.household_id,
    familyId: r.family_id,
    firstName: r.first_name,
    lastName: r.last_name,
    middleName: r.middle_name,
    extensionName: r.extension_name,
    dateOfBirth: r.date_of_birth,
    sex: r.sex,
    civilStatus: r.civil_status,
    citizenship: r.citizenship,
    occupation: r.occupation,
    bloodType: r.blood_type,
    religion: r.religion,
    contactNumber: r.contact_number,
    email: r.email,
    isActive: r.is_active,
    createdAt: r.created_at
  }));
};
