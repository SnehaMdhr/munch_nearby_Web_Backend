import { FavouriteModel, IFavourite } from "../model/favourite.model";


export interface IFavouriteRepository {
  create(data: Partial<IFavourite>): Promise<IFavourite>;
  find(customerId: string, restaurantId: string): Promise<IFavourite | null>;
  findByCustomer(customerId: string): Promise<IFavourite[]>;
  delete(customerId: string, restaurantId: string): Promise<boolean>;
}

export class FavouriteRepository implements IFavouriteRepository {

  async create(data: Partial<IFavourite>): Promise<IFavourite> {
    const favorite = new FavouriteModel(data);
    return await favorite.save();
  }

  async find(customerId: string, restaurantId: string) {
    return await FavouriteModel.findOne({
      customer: customerId,
      restaurant: restaurantId
    });
  }

  async findByCustomer(customerId: string) {
    return await FavouriteModel.find({
      customer: customerId
    }).populate("restaurant");
  }

  async delete(customerId: string, restaurantId: string) {
    const result = await FavouriteModel.findOneAndDelete({
      customer: customerId,
      restaurant: restaurantId
    });

    return !!result;
  }
}
