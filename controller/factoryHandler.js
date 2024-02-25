const catchAsync = require('./../utils/catchAsync');
const ErrorApp = require('../utils/errApp');
const ApiFeatures = require('./../utils/apitFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ErrorApp('Can not find the document !', 404));
    }
    return res.status(200).json({
      status: 'success',
      message: 'detele successfully',
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
    });
    const doc = await Model.findById(req.params.id);
    return res.status(200).json({
      status: 'success',
      data: { doc: doc },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new ErrorApp('Can not find the document ', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });
exports.getAll = (Model) =>
  (exports.getAllTours = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const ApiFeature = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await ApiFeature.query;
    return res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc,
    });
  }));
