# Ghi chú bản dịch và bài tập

Bản dịch được biên soạn trực tiếp từ bài đọc tiếng Anh, dùng skill `viet-kien-thuc-de-hieu` làm lớp hướng dẫn: tiếng Việt tự nhiên cho người mới, giữ thuật ngữ, số liệu, điều kiện, quan hệ và mức chắc chắn của nguồn. Đã đối chiếu theo từng khối đoạn; các câu thoại có bản nghĩa tiếng Việt trong đoạn tương ứng. Nguồn tiếng Anh được giữ nguyên. Các dữ kiện pháp lý, tài chính và y tế của tài liệu chưa được xác minh lại trong lần nâng cấp này.

Bài tập gồm 3 vòng, mỗi vòng 5 câu:

1. Bài tập gốc. Bài 40 thiếu câu thứ 5 nên bổ sung một câu với `low-stakes`. Câu 5 của bài 33 trong nguồn không có ô trống; chuyển `529 plan` thành ô cần điền.
2. Câu trích từ bài đọc, bỏ một thuật ngữ để luyện ngữ cảnh.
3. Ghép nghĩa tiếng Việt trong mục từ vựng với thuật ngữ tiếng Anh.

Các câu gốc có hai ô trống được giữ đủ cả hai đáp án. Các lựa chọn cùng chữ có thể thay thế cho nhau; chấm theo nội dung từ, không theo vị trí hoặc ID nút. Câu đúng được khóa; làm lại chỉ xóa các ô chưa đúng. Không tiết lộ đáp án qua nút hiện đáp án.

Kiểm tra tự động bảo đảm 43 bài, 195 khối dịch và 645 câu. Kết quả kiểm tra trình duyệt được ghi khi hoàn tất.

Kiểm thử tương tác dùng jsdom: bật/tắt bản dịch, phím Enter, ẩn/hiện độc lập từng đoạn, điền từ qua sự kiện bấm, chấm cả ô sai và ô bỏ trống, khóa ô đúng, làm lại chỉ ô sai, đưa focus về ô cần sửa, đi qua ba vòng, hoàn thành và lưu tiến độ, câu nhiều ô trống. Đã chạy cả 43 màn bài học và 129 vòng qua bộ xử lý sự kiện thực. Có kiểm tra lời gọi hiệu ứng bay; chưa kiểm tra hình ảnh hoặc chuyển động trong trình duyệt thật vì quyền dùng trình duyệt đang tắt.
