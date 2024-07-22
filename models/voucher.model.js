const mongodb = require("mongodb");

const db = require("../data/database");

class Voucher {
  constructor(voucherData) {
    this.title = voucherData.title;
    this.value = voucherData.value;
    this.point = voucherData.point;
    this.expiration = new Date(voucherData.expiration);
    this.image = voucherData.image; // the name of the image file
    this.updateImageData();
    if (voucherData._id) {
      this.id = voucherData._id.toString();
    }
    this.isSpecial = voucherData.isSpecial;
  }

  static async findById(voucherId) {
    let vouId;
    try {
      vouId = new mongodb.ObjectId(voucherId);
    } catch (error) {
      error.code = 404;
      throw error;
    }
    const voucher = await db
      .getDb()
      .collection("vouchers")
      .findOne({ _id: vouId });

    if (!voucher) {
      const error = new Error("Could not find voucher with provided id.");
      error.code = 404;
      throw error;
    }

    return new Voucher(voucher);
  }

  static async findAll() {
    const vouchers = await db.getDb().collection("vouchers").find().toArray();

    vouchers.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "accent" })
    );

    return vouchers.map(function (voucherDocument) {
      return new Voucher(voucherDocument);
    });
  }

  static async findExpired() {
    const vouchers = await db
      .getDb()
      .collection("vouchers")
      .find({ expiration: { $lt: new Date() } })
      .toArray();

    vouchers.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "accent" })
    );

    return vouchers.map(function (voucherDocument) {
      return new Voucher(voucherDocument);
    });
  }

  static async findSpecial() {
    const vouchers = await db
      .getDb()
      .collection("vouchers")
      .find({
        isSpecial: true,
        expiration: { $gte: new Date() },
      })
      .toArray();

    vouchers.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "accent" })
    );

    return vouchers.map(function (voucherDocument) {
      return new Voucher(voucherDocument);
    });
  }

  static async findAvailable(availableIds) {
    availableIds.forEach((element) => {
      element = new mongodb.ObjectId(element);
    });
    const vouchers = await db
      .getDb()
      .collection("vouchers")
      .find({ _id: { $nin: availableIds } })
      .toArray();

    vouchers.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "accent" })
    );

    return vouchers.map(function (voucherDocument) {
      return new Voucher(voucherDocument);
    });
  }

  static async findOwn(availableIds) {
    const vouchers = await db
      .getDb()
      .collection("vouchers")
      .find({ _id: { $in: availableIds } })
      .toArray();

    vouchers.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "accent" })
    );

    return vouchers.map(function (voucherDocument) {
      return new Voucher(voucherDocument);
    });
  }

  updateImageData() {
    this.imagePath = `image-data/images/${this.image}`;
    this.imageUrl = `/assets/images/${this.image}`;
  }

  async save() {
    const voucherData = {
      title: this.title,
      value: this.value,
      point: this.point,
      expiration: this.expiration,
      image: this.image,
      isSpecial: this.isSpecial,
    };

    if (this.id) {
      const voucherId = new mongodb.ObjectId(this.id);

      if (!this.image) {
        delete voucherData.image;
      }

      await db.getDb().collection("vouchers").updateOne(
        { _id: voucherId },
        {
          $set: voucherData,
        }
      );
    } else {
      await db.getDb().collection("vouchers").insertOne(voucherData);
    }
  }

  replaceImage(newImage) {
    this.image = newImage;
    this.updateImageData();
  }

  remove() {
    const voucherId = new mongodb.ObjectId(this.id);
    return db.getDb().collection("vouchers").deleteOne({ _id: voucherId });
  }
}

module.exports = Voucher;
