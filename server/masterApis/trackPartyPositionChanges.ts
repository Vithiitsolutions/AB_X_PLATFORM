import mercury from "@mercury-js/core";
import { ObjectId } from "mongodb";

interface IJourneyStep {
  changedOn: Date;
  politicalParty: string | null;
  partyLogo: string | null;
  positionStatus: string | null;
}
export async function getUserPoliticalPartyHistory(userId: string) {
  try {
    if (!ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format. Must be a 24-character hex string.");
    }
    const userAttribute = await mercury.db.UserAttribute.mongoModel.findOne({
      user: new ObjectId(userId),
    });
    if (!userAttribute) {
      return [];
    }
    const [currentParty, currentStatus] = await Promise.all([
      userAttribute.politicalParty
        ? await mercury.db.Party.mongoModel.findById(userAttribute.politicalParty)
        : null,
      userAttribute.positionStatus
        ? await mercury.db.PositionStatus.mongoModel.findById(userAttribute.positionStatus)
        : null,
    ]);
    const currentPartyLogoFile = currentParty?.logo
      ? await mercury.db.File.mongoModel.findById(currentParty.logo)
      : null;
    const initialStep: IJourneyStep = {
      changedOn: userAttribute.createdOn || new Date(),
      politicalParty: currentParty?.name || null,
      partyLogo: currentPartyLogoFile?.location || null, 
      positionStatus: currentStatus?.value || null,
    };
    const allHistories = await mercury.db.UserAttributeHistory.mongoModel
      .find({ 
        recordId: userAttribute._id
      })
      .sort({ createdOn: 1 });
    const journey: IJourneyStep[] = [initialStep];
    for (const history of allHistories) {
      const lastStep = journey[journey.length - 1];
      const newStep: IJourneyStep = { ...lastStep, changedOn: history.createdOn };
      if (history.dataType === "Party" && history.fieldName === "politicalParty") {
        const newParty = await mercury.db.Party.mongoModel.findById(history.newValue);
        const newPartyLogoFile = newParty?.logo
          ? await mercury.db.File.mongoModel.findById(newParty.logo)
          : null;
        newStep.politicalParty = newParty?.name || null;
        newStep.partyLogo = newPartyLogoFile?.location || null; 
      } else if (history.dataType === "Status" && history.fieldName === "positionStatus") {
        const newStatus = await mercury.db.PositionStatus.mongoModel.findById(history.newValue);
        newStep.positionStatus = newStatus?.value || null;
      }
      if (newStep.politicalParty !== lastStep.politicalParty || newStep.positionStatus !== lastStep.positionStatus) {
        journey.push(newStep);
      }
    }
    return journey;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("BSONError: input must be a 24 character hex string")) {
        throw new Error("Invalid userId format. Please provide a valid 24-character ID.");
      }
      throw err;
    }
    throw new Error("An unexpected error occurred.");
  }
}
