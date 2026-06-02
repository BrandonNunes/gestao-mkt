-- AlterTable
CREATE SEQUENCE cautela_numero_seq;
ALTER TABLE "Cautela" ALTER COLUMN "numero" SET DEFAULT nextval('cautela_numero_seq');
ALTER SEQUENCE cautela_numero_seq OWNED BY "Cautela"."numero";
