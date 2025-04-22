type Access = Record<string, boolean>;

type FieldPermissions = Record<string, Access>;

export interface ProfilePermission {
  modelName: string;
  access: Access;
  fieldLevelAccess?: boolean;
  fields?: FieldPermissions;
}

/**
 * Merge two access permission objects.
 * Returns a new object where each permission is true if either source has it true.
 */
function mergeAccessPermissions(a: Access = {}, b: Access = {}): Access {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: Access = {};

  for (const key of keys) {
    result[key] = !!(a[key] || b[key]);
  }

  return result;
}

/**
 * Merge two sets of field-level permissions.
 */
function mergeFieldPermissions(a: FieldPermissions = {}, b: FieldPermissions = {}): FieldPermissions {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: FieldPermissions = {};

  for (const key of keys) {
    result[key] = mergeAccessPermissions(a[key], b[key]);
  }

  return result;
}

/**
 * Merge two arrays of profile permissions, deeply combining access and field-level permissions.
 */
export function mergeProfilePermissions(
  basePermissions: ProfilePermission[] = [],
  overridePermissions: ProfilePermission[] = []
): ProfilePermission[] {
  return [...basePermissions, ...overridePermissions].reduce<ProfilePermission[]>((acc, current) => {
    const existing = acc.find(item => item.modelName === current.modelName);

    if (!existing) {
      acc.push({ ...current });
    } else {
      // Merge access permissions
      existing.access = mergeAccessPermissions(existing.access, current.access);

      // Handle field-level access
      const fla1 = existing.fieldLevelAccess ?? false;
      const fla2 = current.fieldLevelAccess ?? false;
      const combinedFLA = fla1 && fla2;

      existing.fieldLevelAccess = combinedFLA;

      if (combinedFLA) {
        existing.fields = mergeFieldPermissions(existing.fields, current.fields);
      } else {
        delete existing.fields;
      }
    }

    return acc;
  }, []);
}

export function overrideWithExplicitPermissions(
  inherited: ProfilePermission[] = [],
  custom: ProfilePermission[] = []
): ProfilePermission[] {
  const result = [...inherited];
  for (const customPermission of custom) {
    const index = result.findIndex(p => p.modelName === customPermission.modelName);

    if (index !== -1) {
      const existingPermission = result[index] ?? {};
      const existingFields = existingPermission.fields ?? {};
      const finalPermission: ProfilePermission = {
        modelName: customPermission.modelName,
        access: customPermission.access && Object.keys(customPermission.access).length ? customPermission.access : existingPermission.access,
        fieldLevelAccess: customPermission.fieldLevelAccess ?? existingPermission.fieldLevelAccess,
        fields: customPermission.fields && Object.keys(customPermission.fields).length
          ? {
            ...existingFields,
            ...customPermission.fields // replaces matching field keys
          }
          : existingFields
      };
      result[index] = { ...finalPermission };

    } else {
      result.push({ ...customPermission }); // Add if not present
    }
  }

  return result;
}

export const profilePipeline = [
  {
    $lookup: {
      from: "permissions",
      localField: "_id",
      foreignField: "profile",
      as: "permissions",
    },
  },
  {
    $lookup: {
      from: "fieldpermissions",
      let: { profileId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$profile", "$$profileId"],
            },
          },
        },
      ],
      as: "fieldPermissions",
    },
  },
  {
    $addFields: {
      permissions: {
        $map: {
          input: "$permissions",
          as: "permission",
          in: {
            $mergeObjects: [
              "$$permission",
              {
                fieldPermissions: {
                  $filter: {
                    input: "$fieldPermissions",
                    as: "fieldPermission",
                    cond: {
                      $and: [
                        { $eq: ["$$fieldPermission.profile", "$$permission.profile"] },
                        { $eq: ["$$fieldPermission.model", "$$permission.model"] },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    $project: {
      fieldPermissions: 0, // Remove redundant fieldPermissions from root level
    },
  },
];