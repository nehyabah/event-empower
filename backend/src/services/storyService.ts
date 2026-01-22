import { CoupleStoryModel, UpsertCoupleStoryInput } from '../models/CoupleStory.js';
import { StoryImageModel, CreateStoryImageInput } from '../models/StoryImage.js';
import { StoryCommentModel, CreateStoryCommentInput } from '../models/StoryComment.js';
import { WishlistItemModel, CreateWishlistItemInput, UpdateWishlistItemInput } from '../models/WishlistItem.js';
import { BankDetailModel, CreateBankDetailInput, UpdateBankDetailInput } from '../models/BankDetail.js';

export const storyService = {
  async getStoryBundle(userId: string) {
    const [story, images, comments, wishlist, bankDetails] = await Promise.all([
      CoupleStoryModel.findByUserId(userId),
      StoryImageModel.listByUserId(userId),
      StoryCommentModel.listByUserId(userId),
      WishlistItemModel.listByUserId(userId),
      BankDetailModel.listByUserId(userId),
    ]);

    return {
      story,
      images,
      comments,
      wishlist,
      bankDetails,
    };
  },

  async upsertStory(userId: string, input: UpsertCoupleStoryInput) {
    return CoupleStoryModel.upsert(userId, input);
  },

  async listImages(userId: string) {
    return StoryImageModel.listByUserId(userId);
  },

  async addImage(userId: string, input: CreateStoryImageInput) {
    return StoryImageModel.create(userId, input);
  },

  async deleteImage(userId: string, id: string) {
    return StoryImageModel.delete(userId, id);
  },

  async listComments(userId: string) {
    return StoryCommentModel.listByUserId(userId);
  },

  async addComment(userId: string, input: CreateStoryCommentInput) {
    return StoryCommentModel.create(userId, input);
  },

  async listWishlist(userId: string) {
    return WishlistItemModel.listByUserId(userId);
  },

  async addWishlistItem(userId: string, input: CreateWishlistItemInput) {
    return WishlistItemModel.create(userId, input);
  },

  async updateWishlistItem(userId: string, id: string, input: UpdateWishlistItemInput) {
    return WishlistItemModel.update(userId, id, input);
  },

  async deleteWishlistItem(userId: string, id: string) {
    return WishlistItemModel.delete(userId, id);
  },

  async listBankDetails(userId: string) {
    return BankDetailModel.listByUserId(userId);
  },

  async addBankDetail(userId: string, input: CreateBankDetailInput) {
    return BankDetailModel.create(userId, input);
  },

  async updateBankDetail(userId: string, id: string, input: UpdateBankDetailInput) {
    return BankDetailModel.update(userId, id, input);
  },

  async deleteBankDetail(userId: string, id: string) {
    return BankDetailModel.delete(userId, id);
  },
};
