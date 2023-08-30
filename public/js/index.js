$(document).ready(function() {
    $(window).on('scroll', function() {
      var scrollPx = $(this).scrollTop();
        console.log(scrollPx);
        // untuk doa
      if (scrollPx > 565){
        $("#kotak_doa").attr("id","kotak_doa_muncul");
        console.log("muncul");
      }
      if(scrollPx > 990){
      $("#kotak_about_profile").attr("id","kotak_about_profile_muncul");
      console.log("muncul");
      }
      if(scrollPx > 1025){
        $("#kotak_about_mempelai").attr("id","kotak_about_mempelai_muncul");
        console.log("muncul");
      }
      if(scrollPx > 1100){
          $("#kotak_img_mempelai_cowo").attr("id","kotak_img_mempelai_cowo_muncul");
          console.log("muncul");
        }  
      if(scrollPx > 1300){
        $("#kotak_foto_panggilan_mempelai_pria").attr("id","kotak_foto_panggilan_mempelai_pria_muncul");
        console.log("muncul");
      }
      if(scrollPx > 1360){
      $("#kotak_nama_lengkap_mempelai_pria").attr("id","kotak_nama_lengkap_mempelai_pria_muncul");
      console.log("muncul"); 
    }
      if(scrollPx > 1421){
        $("#kotak_putra_dari_mempelai_pria").attr("id","kotak_putra_dari_mempelai_pria_muncul");
        console.log("muncul");  
      }
      if(scrollPx > 1440){
          $("#kotak_nama_orangtua_dari_mempelai_pria").attr("id","kotak_nama_orangtua_dari_mempelai_pria_muncul");
          console.log("muncul");  
        }
      if(scrollPx > 1500){
      $("#kotak_nama_instagram_dari_mempelai_pria").attr("id","kotak_nama_instagram_dari_mempelai_pria_muncul");
      console.log("muncul");    
    }
      if(scrollPx > 1550){
        $("#kotak_dan_dari_kedua_mempelai_pria").attr("id","kotak_dan_dari_kedua_mempelai_pria_muncul");
        console.log("muncul");        
      }
     if(scrollPx > 1600){
      $("#kotak_img_mempelai_wanita").attr("id","kotak_img_mempelai_wanita_muncul");
      console.log("muncul");    
    }
      if(scrollPx > 1700){
        $("#kotak_foto_panggilan_mempelai_wanita").attr("id","kotak_foto_panggilan_mempelai_wanita_muncul");
        console.log("muncul");      
      }
      if(scrollPx > 1800){
          $("#kotak_nama_lengkap_mempelai_wanita").attr("id","kotak_nama_lengkap_mempelai_wanita_muncul");
          console.log("muncul");
        }
        if(scrollPx > 1950){
          $("#kotak_putri_dari_mempelai_wanita").attr("id","kotak_putri_dari_mempelai_wanita_muncul");
          console.log("muncul");
        }
        if(scrollPx > 2050){
          $("#kotak_nama_orangtua_dari_mempelai_wanita").attr("id","kotak_nama_orangtua_dari_mempelai_wanita_muncul");
          console.log("muncul");
        }
      if(scrollPx > 2100){
      $("#kotak_nama_instagram_dari_mempelai_wanita").attr("id","kotak_nama_instagram_dari_mempelai_wanita_muncul");
      console.log("muncul");  
    }
      if(scrollPx > 2150){
        $("#kotak_tulisan_akad").attr("id","kotak_tulisan_akad_muncul");
        console.log("muncul");  
      }
        if(scrollPx > 2200){
          $("#kotak_gambar_akad").attr("id","kotak_gambar_akad_muncul");
          console.log("muncul");
        }
        if(scrollPx > 2250){
          $("#kotak_akad_hari").attr("id","kotak_akad_hari_muncul");
          console.log("muncul");
        }
        if(scrollPx > 2300){
          $("#kotak_akad_tanggal").attr("id","kotak_akad_tanggal_muncul");
          console.log("muncul");
        }
        if(scrollPx > 2350){
          $("#kotak_akad_jam").attr("id","kotak_akad_jam_muncul");
          console.log("muncul");  
        }
          if(scrollPx > 2400){
            $("#kotak_gambar_akad_tutup").attr("id","kotak_gambar_akad_tutup_muncul");
            console.log("muncul");  
          }
            if(scrollPx > 2450){
              $("#kotak_tulisan_resepsi").attr("id","kotak_tulisan_resepsi_muncul");
              console.log("muncul");  
            }
              if(scrollPx > 2500){
                $("#kotak_gambar_resepsi").attr("id","kotak_gambar_resepsi_muncul");
                console.log("muncul");
              }
              if(scrollPx > 2550){
                $("#kotak_resepsi_hari").attr("id","kotak_resepsi_hari_muncul");
                console.log("muncul");
              }
              if(scrollPx > 2600){
                $("#kotak_resepsi_tanggal").attr("id","kotak_resepsi_tanggal_muncul");
                console.log("muncul");
              }
              if(scrollPx > 2650){
                $("#kotak_resepsi_jam").attr("id","kotak_resepsi_jam_muncul");
                console.log("muncul");  
              }
                if(scrollPx > 2700){
                  $("#kotak_gambar_resepsi_tutup").attr("id","kotak_gambar_resepsi_tutup_muncul");
                  console.log("muncul");  
                }
    });
  });
