const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const monNuocSchema = new mongoose.Schema({

    ten: { type: String, required: true },
    loai: { type: String, required: true },
    yeuThich: { type: Number, default: 0 },
    gia: { type: Number, required: true },
    hinhAnh: { type: String },
    moTa: { type: String },
    likedBy: [{ type: String, ref: 'User' }]
});

const MonNuoc = mongoose.model('MonNuoc', monNuocSchema, 'monNuoc');

router.get('/', async (req, res) => {
    try {
        const monNuoc = await MonNuoc.find();
        res.json(monNuoc);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách món nước', error: err });
    }
});


router.post('/', async (req, res) => {
    const { ten, loai, yeuThich, gia, hinhAnh, moTa } = req.body;
    const monNuocMoi = new MonNuoc({
        ten, loai, yeuThich, gia, hinhAnh, moTa
    });

    try {

        const savedMonNuoc = await monNuocMoi.save();
        res.status(201).json(savedMonNuoc);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi thêm món nước', error: err });
    }
});

const { ObjectId } = mongoose.Types;

router.put('/:id/like', async (req, res) => {
    const { idUser } = req.body;

    if (!idUser) {
        return res.status(400).json({ message: 'Vui lòng cung cấp idUser' });
    }

    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'ID món nước không hợp lệ' });
    }

    try {
        const userExists = await mongoose.model('User').findOne({ idUser });
        if (!userExists) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const monNuoc = await MonNuoc.findById(req.params.id);
        if (!monNuoc) {
            return res.status(404).json({ message: 'Không tìm thấy món nước' });
        }

        if (monNuoc.likedBy.includes(idUser)) {
            return res.status(400).json({ message: 'Bạn đã thích món này rồi!' });
        }

        monNuoc.likedBy.push(idUser);
        monNuoc.yeuThich += 1;

        const updatedMonNuoc = await monNuoc.save();
        res.json(updatedMonNuoc);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật lượt thích', error: err.message });
    }
});


router.get('/types', async (req, res) => {
    try {
        const types = await MonNuoc.distinct('loai');
        res.json(types);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách loại đồ uống', error: err });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { ten, loai } = req.query;
        const query = {};
        if (ten) {
            query.ten = { $regex: ten, $options: 'i' };

        }
        if (loai) {
            query.loai = loai;
        }
        const monNuoc = await MonNuoc.find(query);
        res.json(monNuoc);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi tìm kiếm món nước', error: err });
    }
});


module.exports = router;