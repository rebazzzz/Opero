CREATE UNIQUE INDEX "Client_id_organizationId_key" ON "Client"("id", "organizationId");

ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

ALTER TABLE "Project"
ADD CONSTRAINT "Project_clientId_organizationId_fkey"
FOREIGN KEY ("clientId", "organizationId") REFERENCES "Client"("id", "organizationId")
ON DELETE RESTRICT ON UPDATE CASCADE;
