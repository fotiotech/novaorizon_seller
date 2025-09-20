"use server";
import { connection } from "@/utils/connection";
import AttributeGroup from "@/models/AttributesGroup";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export interface Group {
  _id: string;
  code: string;
  name: string;
  parent_id: string;
  attributes?: string[] | [{ name: string; _id?: string }];
  createdAt?: Date;
  group_order: number;
  sort_order: number;
  children?: Group[];
}

function serializeGroup(group: any): Group {
  return {
    _id: group._id.toString(),
    code: group.code,
    name: group.name,
    parent_id: group.parent_id ? group.parent_id.toString() : "",
    attributes: group.attributes
      ? group.attributes.map((a: any) =>
          a === ""
            ? a.toString()
            : { _id: a._id?.toString(), code: a.code, name: a.name }
        )
      : [],
    createdAt: group.createdAt ? new Date(group.createdAt) : undefined,
    group_order: group.group_order,
    sort_order: group.sort_order,
  };
}

function buildTree(flatGroups: Group[]): Group[] {
  const map: Record<string, Group & { children: Group[] }> = {};
  flatGroups.forEach((g) => (map[g._id] = { ...g, children: [] }));

  const roots: (Group & { children: Group[] })[] = [];
  flatGroups.forEach((g) => {
    if (g.parent_id) {
      const parent = map[g.parent_id];
      if (parent) parent.children.push(map[g._id]);
    } else {
      roots.push(map[g._id]);
    }
  });

  const sortTree = (nodes: (Group & { children: Group[] })[]) => {
    nodes.sort((a, b) => a.group_order - b.group_order);
    nodes.forEach((n: any) => sortTree(n.children));
  };

  sortTree(roots);
  return roots;
}

export async function findAttributeForGroups(
  id?: string
): Promise<Group[] | null> {
  await connection();
  try {
    const filter = id ? { _id: new mongoose.Types.ObjectId(id) } : {};
    const attributeGroups = await AttributeGroup.find(filter)
      .populate("attributes", "_id code name")
      .lean();
    return attributeGroups.map(serializeGroup);
  } catch (error) {
    console.error("[AttributeGroup] Error in findAttributeForGroups:", error);
    return null;
  }
}

export async function findAllAttributeGroups(
  id?: string
): Promise<Group[] | null> {
  await connection();
  try {
    const filter = id ? { _id: new mongoose.Types.ObjectId(id) } : {};
    const attributeGroups = await AttributeGroup.find(filter)
      .populate("attributes", "name code _id")
      .lean();
    return buildTree(attributeGroups.map(serializeGroup));
  } catch (error) {
    console.error("[AttributeGroup] Error in findAllAttributeGroups:", error);
    return null;
  }
}

export async function createAttributeGroup(
  action: string | null,
  groupId: string,
  name: string,
  code: string,
  parent_id: string,
  attributes: string[] = [],
  group_order: number
) {
  await connection();
  try {
    if (!action) return;
    if (action === "add attributes" && attributes.length > 0) {
      const objectIdAttributes = attributes.map(
        (attr) => new mongoose.Types.ObjectId(attr)
      );
      const res = await AttributeGroup.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(groupId) },
        {
          $addToSet: {
            attributes: { $each: objectIdAttributes },
          },
        },
        { new: true }
      );
      revalidatePath("/attributes");
      return serializeGroup(res);
    } else if (action === "create" || action === "edit") {
      const newGroup = await AttributeGroup.findOneAndUpdate(
        { name },
        {
          code,
          name,
          parent_id: parent_id ? parent_id : undefined,
          attributes: attributes.map(
            (attr) => new mongoose.Types.ObjectId(attr)
          ),
          group_order: group_order ?? null,
        },
        { upsert: true, new: true, lean: true }
      );
      revalidatePath("/attributes");
      return serializeGroup(newGroup);
    }
  } catch (error) {
    console.error("[AttributeGroup] Error creating group:", error);
    throw error;
  }
}

export async function findGroup(id?: string) {
  try {
    await connection();

    const buildGroupTreeWithValues = (
      groups: any[],
      parentId: string | null = null
    ): any[] => {
      return groups
        .filter(
          (group) =>
            (!parentId && !group.parent_id) ||
            (parentId && group.parent_id?.toString() === parentId)
        )
        .sort((a, b) => a.group_order - b.group_order)
        .map((group) => ({
          _id: group._id?.toString(),
          code: group.code,
          name: group.name,
          parent_id: group.parent_id?.toString(),
          group_order: group.group_order,
          attributes: group.attributes,
          children: buildGroupTreeWithValues(groups, group?._id?.toString()),
        }));
    };

    // Always fetch all groups to build the complete tree
    const groups = await AttributeGroup.find({})
      .populate("attributes")
      .sort({ sort_order: 1 })
      .lean()
      .exec();

    if (!groups || groups.length === 0) {
      console.error("No groups found");
      return []; // Return empty array if no groups exist
    }

    // If an ID is provided, find the specific group within the complete tree
    if (id) {
      const entireTree = buildGroupTreeWithValues(groups);
      const findGroupInTree = (tree: any[], targetId: string): any => {
        for (const node of tree) {
          if (node._id === targetId) return node;
          if (node.children) {
            const found = findGroupInTree(node.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const groupNode = findGroupInTree(entireTree, id);
      if (!groupNode) {
        return { success: false, error: "Group not found" };
      }
      return groupNode;
    }

    // If no ID is provided, return the entire tree
    return buildGroupTreeWithValues(groups);
  } catch (error) {
    console.error("Error finding groups:", error);
    return { success: false, error: "Failed to fetch groups" };
  }
}

export async function updateAttributeGroup(
  id: string,
  updates: Partial<{
    name: string;
    code: string;
    parent_id: string | null;
    attributes: string[];
    group_order: number;
  }>
) {
  await connection();
  try {
    const updateData: any = { ...updates };

    // Safely convert parent_id
    if (
      updates.parent_id &&
      mongoose.Types.ObjectId.isValid(updates.parent_id)
    ) {
      updateData.parent_id = new mongoose.Types.ObjectId(updates.parent_id);
    } else if (updates.parent_id === "" || updates.parent_id === null) {
      updateData.parent_id = null;
    }

    // Replace existing attributes with the new selection (allows both adding and removing)
    if (updates.attributes) {
      updateData.attributes = updates.attributes
        .filter((attr) => mongoose.Types.ObjectId.isValid(attr))
        .map((attr) => new mongoose.Types.ObjectId(attr));
    }

    const updated = await AttributeGroup.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    revalidatePath("/attributes");
    return serializeGroup(updated);
  } catch (error) {
    console.error("[AttributeGroup] Error updating group:", error);
    throw error;
  }
}

export async function deleteAttributeGroup(id: string) {
  await connection();
  try {
    await AttributeGroup.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(id),
    });
    revalidatePath("/attributes");
    return { success: true };
  } catch (error) {
    console.error("[AttributeGroup] Error deleting group:", error);
    throw error;
  }
}
