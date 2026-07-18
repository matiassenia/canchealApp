-- Non-destructive indexes for common read paths.
CREATE INDEX "Club_ownerId_idx" ON "Club"("ownerId");
CREATE INDEX "Club_zone_idx" ON "Club"("zone");
CREATE INDEX "Field_clubId_idx" ON "Field"("clubId");
CREATE INDEX "Availability_fieldId_weekday_idx" ON "Availability"("fieldId", "weekday");
CREATE INDEX "Booking_fieldId_startAt_endAt_idx" ON "Booking"("fieldId", "startAt", "endAt");
CREATE INDEX "Booking_userId_startAt_idx" ON "Booking"("userId", "startAt");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
