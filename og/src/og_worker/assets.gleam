//// OGP画像に埋め込む画像アセット (data URI)。
//// WorkerではASSETS bindingから読み込んだPNGをbase64化して渡す。

pub type Assets {
  Assets(background_data_uri: String, icon_data_uri: String)
}
