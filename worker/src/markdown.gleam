import mork

pub fn render(input: String) -> String {
  mork.configure()
  |> mork.tables(enable: True)
  |> mork.heading_ids(enable: True)
  |> mork.parse_with_options(input)
  |> mork.to_html
}
