# Sống Mỹ • Everyday American English

Website học tiếng Anh, văn hóa và đời sống Hoa Kỳ cho người Việt.

- 43 bài học lấy từ giáo trình gốc.
- 195 khối bài đọc có bản dịch tiếng Việt; bấm vào đoạn để bật/tắt.
- 15 câu mỗi bài, chia thành 3 vòng: tình huống, ngữ cảnh bài đọc, nghĩa từ vựng.
- Chọn ô rồi bấm từ để điền; kiểm tra, giữ câu đúng, tô đỏ câu sai và yêu cầu làm lại.
- Hoàn thành đủ 3 vòng để ghi nhận bài học; tiến độ lưu trên trình duyệt.

## Chạy và kiểm tra

```sh
python3 build_learning.py
npm ci
npm test
python3 -m http.server 8765 --directory dist
```

Mở http://localhost:8765 để xem. Không cần API, tài khoản hay máy chủ ứng dụng.

## Cấu trúc

- `dist/`: website tĩnh được xuất bản bằng GitHub Pages.
- `course-source.json`: nội dung gốc chia theo bài và mục.
- `translations/01.json` ... `43.json`: bản dịch đối chiếu theo thứ tự đoạn.
- `build_learning.py`: ghép bản dịch và tạo bộ bài tập từ nguồn đã có.
- `verify-content.mjs`: kiểm tra độ phủ nội dung và hành vi chấm bài/làm lại.
- `.openai/hosting.json`: danh tính của bản Sites cũ, giữ để tham chiếu; bản GitHub Pages không dùng tệp này.

Bản gốc và các con số, chính sách, phát biểu pháp lý trong đó được giữ để học ngôn ngữ. Bản nâng cấp này bổ sung bản dịch và bài tập, chưa rà soát cập nhật luật/chính sách của toàn bộ giáo trình.

## Xuất bản GitHub Pages

Repo nguồn dùng nhánh `main`. Nhánh `gh-pages` chỉ chứa nội dung của `dist/`, được GitHub Pages phục vụ ở thư mục gốc:

```sh
python3 build_learning.py
npm test
git add .
git commit -m 'Update lessons'
git push origin main
git subtree split --prefix dist -b pages-release
git push origin pages-release:gh-pages
git branch -D pages-release
```

Bản website: https://ptoan-pq.github.io/song-my-english-campus/
