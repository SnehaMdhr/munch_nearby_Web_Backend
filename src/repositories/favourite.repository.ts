import { FavoriteModel, IFavorite } from "../model/favourite.model";


export interface IFavoriteRepository {
  create(data: Partial<IFavorite>): Promise<IFavorite>;
  find(customerId: string, restaurantId: string): Promise<IFavorite | null>;
  findByCustomer(customerId: string): Promise<IFavorite[]>;
  delete(customerId: string, restaurantId: string): Promise<boolean>;
}

export class FavoriteRepository implements IFavoriteRepository {

  async create(data: Partial<IFavorite>): Promise<IFavorite> {
    const favorite = new FavoriteModel(data);
    return await favorite.save();
  }

  async find(customerId: string, restaurantId: string) {
    return await FavoriteModel.findOne({
      customer: customerId,
      restaurant: restaurantId
    });
  }

  async findByCustomer(customerId: string) {
    return await FavoriteModel.find({
      customer: customerId
    }).populate("restaurant");
  }

  async delete(customerId: string, restaurantId: string) {
    const result = await FavoriteModel.findOneAndDelete({
      customer: customerId,
      restaurant: restaurantId
    });

    return !!result;
  }
}
