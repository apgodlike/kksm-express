import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const genders = ["Male", "Female"] as const;
  const locations = [
    "Coimbatore",
    "Pollachi",
    "Erode",
    "Tirupur",
    "Mettupalayam",
    "Udumalpet",
    "Gudalur",
    "Ooty",
    "Coonoor",
    "Avinashi",
  ];

  for (let i = 1; i <= 25; i++) {
    const gender = faker.helpers.arrayElement(genders);
    const age = faker.number.int({ min: 21, max: 35 });
    const dob = faker.date.birthdate({ min: age, max: age, mode: "age" });

    const user = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        mobile_number: BigInt("91" + faker.string.numeric(10)),
        is_profile_complete: true,
        profile: {
          create: {
            is_first_register: false,
            profile_for: "Myself",
            name: faker.person.fullName({ sex: gender.toLowerCase() as any }),
            date_of_birth: dob.toISOString(),
            education: faker.person.jobTitle(),
            location: faker.helpers.arrayElement(locations),
            gender,
            kulam: faker.word.words(1),
            mother_tongue: "Tamil",
            height: `${faker.number.int({ min: 150, max: 190 })} cm`,
            ragu_kethu: faker.helpers.arrayElement(["Yes", "No"]),
            sevvai_dhosam: faker.helpers.arrayElement(["Yes", "No"]),
            raasi: faker.word.words(1),
            star: faker.word.words(1),
            marital_status: faker.helpers.arrayElement([
              "Unmarried",
              "Divorced",
              "Widow",
            ]),
            physical_status: faker.helpers.arrayElement([
              "Normal",
              "PhysicallyChallenged",
            ]),
            number_of_brothers: faker.number.int({ min: 0, max: 3 }),
            number_of_brothers_married: faker.number.int({ min: 0, max: 2 }),
            number_of_sisters: faker.number.int({ min: 0, max: 3 }),
            number_of_sisters_married: faker.number.int({ min: 0, max: 2 }),
            father_occupation: faker.person.jobTitle(),
            mother_occupation: faker.person.jobTitle(),
            employment_type: faker.helpers.arrayElement([
              "Private",
              "Government",
              "Business",
              "SelfEmployed",
              "NotEmployed",
            ]),
            employed_in: "Private",
            annual_income: faker.helpers.arrayElement([
              "Lakh_1_to_2",
              "Lakh_2_to_5",
              "Lakh_5_to_10",
              "Lakh_10_to_15",
            ]),
            contact_name: faker.person.fullName(),
            contact_number: "91" + faker.string.numeric(10),
          },
        },
      },
    });

    console.log(`Created user ${i}: ${user.email}`);
  }
}

main()
  .then(() => {
    console.log("✅ Seed complete");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
