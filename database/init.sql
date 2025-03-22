-- Create database
CREATE DATABASE petbuddies;

-- Connect to database
\c petbuddies;

-- Create schema for project
CREATE SCHEMA IF NOT EXISTS petbuddies_schema;

-- Ensure the schema is used
SET search_path TO petbuddies_schema;

-- Create the User table
CREATE TABLE petbuddies_schema."User" (
    "user_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" VARCHAR(255),
    "surname" VARCHAR(255),
    "login" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "join_date" DATE NOT NULL,
    "city" VARCHAR(255),
    "postal_code" VARCHAR(255),
    "street" VARCHAR(255),
    "house_number" VARCHAR(255),
    "apartment_number" INTEGER,
    "phone_number" VARCHAR(20),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "is_banned" BOOLEAN NOT NULL DEFAULT false
);

-- Create the Pet table
CREATE TABLE petbuddies_schema."Pet" (
    "pet_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "pet_name" VARCHAR(255) NOT NULL,
    "creation_date" DATE NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "race" VARCHAR(255) NOT NULL,
    "size" VARCHAR(255),
    "birth_date" DATE,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT fk_ownership_user FOREIGN KEY ("user_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the UserPhoto table
CREATE TABLE petbuddies_schema."UserPhoto" (
    "pet_photo_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "photo_name" VARCHAR(255) NOT NULL,
    "photo_storage" VARCHAR(255) NOT NULL,

    CONSTRAINT fk_user_photo FOREIGN KEY ("user_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the PetPhoto table
CREATE TABLE petbuddies_schema."PetPhoto" (
    "pet_photo_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "pet_id" INTEGER NOT NULL,
    "photo_name" VARCHAR(255) NOT NULL,
    "photo_storage" VARCHAR(255) NOT NULL,

    CONSTRAINT fk_pet_photo FOREIGN KEY ("pet_id") REFERENCES petbuddies_schema."Pet"("pet_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the ReportType table
CREATE TABLE petbuddies_schema."ReportType" (
    "report_type_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "report_type_name" VARCHAR(255) NOT NULL
);

-- Create the MedDocDict table
CREATE TABLE petbuddies_schema."MedDocDict" (
    "doc_type_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "doc_name" VARCHAR(255) NOT NULL
);

-- Create the Post table
CREATE TABLE petbuddies_schema."Post" (
    "post_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "description" TEXT,
    "cost" NUMERIC(10,2),
    CONSTRAINT fk_post_user FOREIGN KEY ("user_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the AdditionalServicesDict table
CREATE TABLE petbuddies_schema."AdditionalServicesDict" (
    "additional_services_dict_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "service_name" VARCHAR(255) NOT NULL
);

-- Create the MedDocs table
CREATE TABLE petbuddies_schema."MedDocs" (
    "meddoc_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "pet_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "validated_date" DATE,
    "doc_type_id" INTEGER NOT NULL,
    "doc" BYTEA NOT NULL,
    CONSTRAINT fk_meddocs_pet FOREIGN KEY ("pet_id") REFERENCES petbuddies_schema."Pet"("pet_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_meddocs_doctype FOREIGN KEY ("doc_type_id") REFERENCES petbuddies_schema."MedDocDict"("doc_type_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the PetCare table
CREATE TABLE petbuddies_schema."PetCare" (
    "petcare_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "post_id" INTEGER NOT NULL,
    "pet_id" INTEGER NOT NULL,
    CONSTRAINT fk_petcare_post FOREIGN KEY ("post_id") REFERENCES petbuddies_schema."Post"("post_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_petcare_pet FOREIGN KEY ("pet_id") REFERENCES petbuddies_schema."Pet"("pet_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the CareAgreement table
CREATE TABLE petbuddies_schema."CareAgreement" (
    "care_agreement_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "post_id" INTEGER NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "agreement_date" DATE NOT NULL,
    CONSTRAINT fk_careagreement_post FOREIGN KEY ("post_id") REFERENCES petbuddies_schema."Post"("post_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_careagreement_volunteer FOREIGN KEY ("volunteer_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the Report table
CREATE TABLE petbuddies_schema."Report" (
    "report_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "who_user_id" INTEGER NOT NULL,
    "whom_user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "report_type_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT fk_report_who FOREIGN KEY ("who_user_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_report_whom FOREIGN KEY ("whom_user_id") REFERENCES petbuddies_schema."User"("user_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_report_post FOREIGN KEY ("post_id") REFERENCES petbuddies_schema."Post"("post_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_report_type FOREIGN KEY ("report_type_id") REFERENCES petbuddies_schema."ReportType"("report_type_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the OwnerRating table
CREATE TABLE petbuddies_schema."OwnerRating" (
    "owner_rating_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "care_agreement_id" INTEGER NOT NULL,
    "description" TEXT,
    "star_number" INTEGER NOT NULL CHECK ("star_number" BETWEEN 1 AND 5),
    CONSTRAINT fk_ownerrating_agreement FOREIGN KEY ("care_agreement_id") REFERENCES petbuddies_schema."CareAgreement"("care_agreement_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the VolunteerRating table
CREATE TABLE petbuddies_schema."VolunteerRating" (
    "volunteer_rating_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "care_agreement_id" INTEGER NOT NULL,
    "description" TEXT,
    "star_number" INTEGER NOT NULL CHECK ("star_number" BETWEEN 1 AND 5),
    CONSTRAINT fk_volunteerrating_agreement FOREIGN KEY ("care_agreement_id") REFERENCES petbuddies_schema."CareAgreement"("care_agreement_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the AdditionalServices table
CREATE TABLE petbuddies_schema."AdditionalServices" (
    "additional_services_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "post_id" INTEGER NOT NULL,
    "additional_service_id" INTEGER NOT NULL,
    "service_date" DATE NOT NULL,
    "service_time" TIME NOT NULL,
    "cost" NUMERIC(10,2),
    CONSTRAINT fk_additionalservices_post FOREIGN KEY ("post_id") REFERENCES petbuddies_schema."Post"("post_id") ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_additionalservices_service FOREIGN KEY ("additional_service_id") REFERENCES petbuddies_schema."AdditionalServicesDict"("additional_services_dict_id") ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create the Postal Codes Dictionary table
CREATE TABLE petbuddies_schema."DPostalCode" (
    "postal_code_id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "postal_code" VARCHAR(6) NOT NULL,
    "place" VARCHAR(255) NOT NULL,
    "latitude" FLOAT NOT NULL,
    "longitude" FLOAT NOT NULL
);

-- Read Postal Codes from file
COPY petbuddies_schema."DPostalCode" (postal_code, place, latitude, longitude)
FROM '/var/lib/postgresql/data_files/postal_codes.csv'
DELIMITER ','
CSV HEADER;

-- Load users into database
COPY petbuddies_schema."User" (name, surname, login, password_hash, join_date, city, postal_code, street, house_number, apartment_number, phone_number, email, is_banned)
FROM '/var/lib/postgresql/data_files/users.csv'
DELIMITER ','
CSV HEADER;

-- Load pets into database
COPY petbuddies_schema."Pet" (user_id, pet_name, creation_date, type, race, size, birth_date)
FROM '/var/lib/postgresql/data_files/pets.csv'
DELIMITER ','
CSV HEADER;
