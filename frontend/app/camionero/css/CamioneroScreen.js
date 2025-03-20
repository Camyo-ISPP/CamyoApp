import { StyleSheet } from 'react-native';
import colors from '@/assets/styles/colors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: 100,
        paddingLeft: 10,
    },
    header: {
        backgroundColor: "#0C4A6E",
        padding: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    headerText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    settingsButton: {
        position: "absolute",
        right: 50,
    },
    content: {
        padding: 15,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start', // Align items to the start
        marginBottom: 20,
        marginLeft: '12.5%', // Adjusted to start at about 75% width of the screen
        position: 'relative', // Changed to relative
        top: 100, // Adjusted to place the profile picture above the banner
    },
    desktopProfileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
        alignSelf: 'flex-start', // Align the container to the start
        marginBottom: 20,
        marginLeft: '12.5%', // Adjusted to start at about 75% width of the screen
        position: 'relative', // Changed to relative
        top: 100, // Adjusted to place the profile picture above the banner
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
        position: 'relative',
        left: 20, // Position the avatar to the left side
        top: -40, // Adjusted to place half of the avatar above the banner
    },
    desktopAvatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 10,
        position: 'fixed',
        left: 350, // Position the avatar to the left side
        top: 150, // Adjusted to place half of the avatar above the banner
    },
    profileDetailsContainer: {
        marginLeft: 50, // Added margin to separate details from avatar
        marginTop: 40, // Adjusted margin to align with the bottom half of the avatar
        position: 'fixed', // Changed to relative    
        top: 100, // Adjusted to place the details below the avatar

        
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    desktopName: {
        fontSize: 32,
        fontWeight: 'bold',
        position: 'fixed',
        left: 600, // Position the avatar to the left side
        top: 260, // Adjusted to place half of the avatar above the banner
    },
    detailsContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center', // Center items horizontally
        width: '100%', // Adjust width as needed
        marginTop: 10, // Added margin to separate details from name
    },
    desktopDetailsContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center', // Center items horizontally
        width: '45%', // Adjust width as needed
        alignSelf: 'center', // Center the container horizontally
    },
    detailsText: {
        fontSize: 20,
        color: 'black',
        marginBottom: 10,
        textAlign: 'left', // Align text to the left
        width: '100%', // Ensure text takes full width
  
    },
    mobileDetailsText: {
        fontSize: 20,
        color: 'black',
        marginBottom: 10,
        textAlign: 'left', // Align text to the left
        width: '100%', // Ensure text takes full width
    },
    desktopDetailsText: {
        fontSize: 15,
        color: 'black',
        marginBottom: 15,
        marginLeft: '1%',
        textAlign: 'left', // Align text to the left
        width: '100%', // Ensure text takes full width
    },
    boldText: {
        fontWeight: 'bold',
    },
    detailItem: {
        marginBottom: 10,
        flexDirection: 'row', // Align icon and text in a row
        width: '100%', // Ensure detail items take full width
    },
    reviewsContainer: {
        marginTop: 10, // Reduced margin to reduce separation
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Centered elements horizontally
    },
    desktopReviewsContainer: {
        marginTop: 10, // Reduced margin to reduce separation
        marginLeft: '22%', // Added margin to separate reviews from details
        flexDirection: 'row',

    },
    reviewCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        marginRight: 10, // Add margin to separate the cards
        borderLeftWidth: 4,
        borderLeftColor: colors.primary, // Use the same color as the "experiencia" button
        width: 150, // Set a fixed width for the review cards
    },
    desktopReviewCard: {
        width: 200, // Set a larger width for the review cards on desktop
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 10,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    reviewText: {
        fontSize: 14,
        color: 'gray',
    },
    icon: {
        fontSize: 20,
        color: colors.secondary,
        marginRight: 10,
        marginLeft: 10,
        position: 'relative',
        top: -2,
        right: 0,
        width: 30,
        textAlign: 'center',
        verticalAlign: 'bottom',
    },
    envelopeIcon: {
        fontSize: 20,
        color: colors.secondary,
        marginRight: 10,
        marginLeft: 10,
        position: 'relative',
        top: -2,
        left: 0,
        width: 30,
        textAlign: 'center',
        verticalAlign: 'bottom',
    },
    truckIcon: {
        fontSize: 20,
        color: colors.secondary,
        marginRight: 10,
        marginLeft: 10,
        position: 'relative',
        top: -2,
        left: 0,
        width: 30,
        textAlign: 'center',
        verticalAlign: 'bottom',
    },

    editProfileButtonContainer: {
        alignItems: 'center',
        marginBottom: 20,
        width:'100%',

    },
    editProfileButton: {
        backgroundColor: colors.primary,
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        left:'30%',
    },
    desktopEditProfileButton: {
        backgroundColor: colors.primary,
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        left:'200%',
        top:'-10%',
        width: '40%',
    },
    editProfileButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bannerContainer: {
        position: 'fixed',
        top: 50, // Adjusted to place the banner below the profile
        width: '100%',
        left: 0,
        height: 200,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    desktopInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Align items to the start
        marginTop: 20,
    },
    infoText: {
        fontSize: 15,
        color: 'gray',
    },
    desktopInfoText: {
        fontSize: 15,
        color: 'gray',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    desktopPhoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    phoneIcon: {
        fontSize: 35,
        color: colors.primary,
        marginRight: 10,
    },
    desktopPhoneIcon: {
        fontSize: 35,
        color: colors.primary,
        marginRight: 15,
    },
    phoneText: {
        fontSize: 25,
        color: colors.secondary,
        fontWeight: 'bold',
    },
    desktopPhoneText: {
        fontSize: 25,
        color: colors.secondary,
        fontWeight: 'bold',
    },
    detailsOuterContainer: {
        alignItems: 'left',
        position: 'fixed',
        top: 370,
        bottom: 50,
        left: 350,
        width: '100%',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Align items to the start
        position: 'fixed',
        left: 600, // Position the avatar to the left side
        top: 310, // Adjusted to place half of the avatar above the banner
    },
    detailsColumn: {
        flexDirection: 'column', // Stack items vertically
        justifyContent: 'left', // Align items to the start
        alignItems: 'left', // Align items to the start
        position: 'fixed',
        

    },
    infoText: {
        fontSize: 15,
        color: 'gray',
        marginRight: 30, // Added margin to separate the detail lines
    },
    linkText: {
        fontSize: 15,
        color: colors.primary,
        textDecorationLine: 'underline',
        marginBottom: 15,
  
        textAlign: 'left', // Align text to the left
        width: '100%', // Ensure text takes full width
    },
    phone: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
        backgroundColor: colors.white,
      },
      searchIcon: {
        color: colors.primary,
        marginRight: 10,
      },
      searchView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: "5%",
        paddingRight: 15,
        paddingLeft: 15,
        marginBottom: 20,
      },
      menuIcon: {
        marginRight: 10,
      },
      barraSuperior: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        flex: 1,
        borderRadius: 25,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      searchInput: {
        backgroundColor: "transparent",
        padding: 10,
        borderRadius: 50,
        borderColor: "transparent",
        marginRight: 3,
        outlineStyle: "none",
      },
      webContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",
        alignContent: "center",
        flex: 1,
        backgroundColor: colors.white,
      },
      card: {
        backgroundColor: colors.white,
        padding: 20,
        marginVertical: 10,
        width: "70%",
        borderRadius: 10,
        display: "flex",
        flexWrap:"wrap",
        flexDirection: "row",
        alignContent: "center",
        alignItems:"center",
        borderLeftWidth: 4,
        borderColor: "red", // Cambia a "green" si quieres un borde verde
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
      scrollview: {
        flex: 1,
        padding: 10,
        marginVertical: 40,
        position: 'absolute',
        top: 20, // Adjust this value based on the height of CamyoWebNavBar
        left: 0,
        right: 0,
        bottom: -40,
      },
    
      scrollviewIndicator: {
        backgroundColor: colors.primary,
        width: 3,
        borderRadius: 1.5,
      },
      companyLogo: {
        height: 90,
        width: 90,
        marginRight:10,
      },
      offerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        flexWrap: "wrap",
        marginBottom: 2,
        color: colors.secondary
      },
      offerDate: {
        fontSize: 12,
        color: "gray", flexWrap: "wrap",
      },
      offerDetails: {
        fontSize: 12,
        fontWeight: "bold",
        flexWrap: "wrap",
      },
      offerDetailsTagExperience: {
        fontSize: 9,
        backgroundColor: colors.secondary,
        borderRadius: 10,
        color: colors.white,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "bold",
        flexWrap: "wrap",
      },
      offerDetailsTagLicense: {
        fontSize: 9,
        backgroundColor: colors.primary,
        color: colors.white,
        borderRadius: 10,
        paddingTop: 2,
        textAlign: "center",
        textAlignVertical: "center",
        paddingBottom: 3,
        paddingLeft: 5,
        paddingRight: 6,
        marginRight: 3,
        fontWeight: "700",
        flexWrap: "wrap",
      },
      offerInfo: {
        fontSize: 12,
        color: "gray",
        marginTop: 5,
        flexWrap: "wrap",
      },
      offerSueldo:{
        fontSize:25,
        fontWeight:"bold",
        textAlign:"right",
        paddingLeft:3,
        color: colors.secondary,
        textAlignVertical:"center",
        width:"35%",
        alignSelf:"center"
      
    
      },
      empresa: {
        fontSize: 20,
        color: '#0b4f6c',
        marginTop: 0,
    },
      button:{
        backgroundColor:colors.primary,
        color:colors.white,
        paddingLeft:5,
        paddingRight:5,
        marginLeft: "2%",
        marginTop:4,
        flexDirection:"row",
        flexWrap:"nowrap",
        height:40,
        width: 150,
        borderRadius:10,
        alignItems:"center",
        justifyContent:"center"
    
    
    
      },
      buttonText:{
        color:colors.white,
        fontWeight:"bold"
      },
      detailsIcon:{
        color:colors.white,
        alignSelf:"center",
        marginLeft:3,
        marginTop:3,
        marginRight:5,
    
      },

        offersContainer: {
            flex: 1,
            width: '65%',
            position: 'fixed',
            top: 350, // Adjusted to place the offers below the header
            left: 400,
            height  : 1000,
            padding: 10,
            marginLeft: 20, // Adjust as needed to position next to the details column
            marginTop: 1, // Adjust to start at the height of the email
        },
        offersButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '65%',
            position: 'absolute', // Match the position of the offers container
            top: 10, // Adjust as needed to match the offers container
            left: 175, // Adjust as needed to match the offers container
            right: 0, // Adjust as needed to match the offers container
            
        },
        
        offersButton: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingVertical: 10,
            marginHorizontal: 5,
            borderRadius: 5,
            alignItems: 'center',
        },
        
        offersButtonText: {
            color: colors.white,
            fontWeight: 'bold',
        },
        // Add styles for the description box and text
       // Add styles for the description box and text
descriptionBox: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    minHeight: 500, // Set a minimum height
    maxHeight: 500, // Set a maximum height
    overflow: 'hidden', // Hide overflow text
    position: 'fixed',
    top:540, // Adjusted to place the description below the details
},

descriptionText: {
    fontSize: 15,
    color: 'dark-gray',
},
noOffersText: {
    fontSize: 20,
    color: colors.secondary
},
editButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
    position: 'fixed',
    top: 250,
    left:1370 // Adjusted to place the button below the profile picture
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;