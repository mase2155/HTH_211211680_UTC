import badmintonImg from '../assets/images/news/badminton.png';
import footballImg from '../assets/images/news/football.webp';
import pickleballImg from '../assets/images/news/pickleball.png';
import tennisImg from '../assets/images/news/tennis.jpg';

export const newsPosts = [
  {
    id: 1,
    image: badmintonImg,
    imageAlt: 'Cầu lông',
    date: 'Tháng Năm 21, 2024',
    title: 'Trạm Cầu Lông Station Badminton – Cụm 9 sân cầu lông hot nhất Cầu Giấy',
    excerpt:
      'Nếu bạn đang tìm một địa điểm chơi cầu lông sang xịn mịn tại khu vực Cầu Giấy, Trạm Cầu Lông Station Badminton là một cái tên đáng để trải nghiệm. Sở hữu cụm 9 [...]',
  },
  {
    id: 2,
    image: footballImg,
    imageAlt: 'Bóng đá',
    date: 'Tháng Ba 1, 2026',
    title: 'Sân bóng Nguyên Dương - 45 Đường Cầu Giấy',
    excerpt:
      'Một sân đá bóng trực thuộc phường Nghĩa Đô trú tại số 45 Cầu Giấy cực kì sang xịn mịn với cảnh quan đẹp cùng chất lượng mặt cỏ tốt và dễ dàng di chuyển tới sân [...]',
  },
  {
    id: 3,
    image: pickleballImg,
    imageAlt: 'Pickleball',
    date: 'Tháng Một 17, 2026',
    title: 'Cụm sân tập luyện Ông Mập Pickleball - Sân 521 Minh Khai',
    excerpt:
      'Nếu anh em đang tìm một địa điểm chơi Pickleball trong nhà tại khu vực Minh Khai, Hà Nội, Ông Mập Pickleball – 521 Minh Khai là một lựa chọn đáng tham khảo bởi chất lượng vượt trội [...]',
  },
  {
    id: 4,
    image: tennisImg,
    imageAlt: 'Tennis',
    date: 'Tháng 12 09, 2025',
    title: 'Cụm 5 sân hot nhất khu đô thị An Khánh - Win Win Tennis',
    excerpt:
      'Mặt sân được trải nhựa asphalt cùng nhiều lớp sơn tăng độ bám sân, giảm chấn giúp người chơi tự tin thực hiện các pha di chuyển liên tục. Sân phối màu chủ đạo màu xanh dương [...]',
  },
];

export const partnerCards = newsPosts.map(({ id, image, imageAlt, title }) => ({
  id,
  image,
  imageAlt,
  title,
}));
