// Simple BaseHub Query Examples
// Use these to test your schema step by step

// 1. Basic site query
const basicSiteQuery = {
  site: {
    _id: true,
    _title: true,
  },
};

// 2. Check if settings exist
const settingsQuery = {
  site: {
    settings: {
      _id: true,
      _title: true,
    },
  },
};

// 3. Check if pages exist
const pagesQuery = {
  site: {
    pages: {
      items: {
        _id: true,
        _title: true,
        pathname: true,
      },
    },
  },
};

// 4. Check if header exists
const headerQuery = {
  site: {
    header: {
      _id: true,
      _title: true,
    },
  },
};

// 5. Check if footer exists
const footerQuery = {
  site: {
    footer: {
      _id: true,
      _title: true,
    },
  },
};

// 6. Check theme settings
const themeQuery = {
  site: {
    settings: {
      theme: {
        accent: true,
        grayScale: true,
      },
    },
  },
};

// 7. Full query (what the template expects)
const fullQuery = {
  site: {
    settings: {
      theme: {
        accent: true,
        grayScale: true,
      },
      logo: {
        dark: {
          url: true,
          alt: true,
          width: true,
          height: true,
          aspectRatio: true,
          blurDataURL: true,
        },
        light: {
          url: true,
          alt: true,
          width: true,
          height: true,
          aspectRatio: true,
          blurDataURL: true,
        },
      },
      metadata: {
        defaultTitle: true,
        titleTemplate: true,
        defaultDescription: true,
      },
      showUseTemplate: true,
    },
    header: {
      navbar: {
        items: {
          _id: true,
          _title: true,
          href: true,
          sublinks: {
            items: {
              _id: true,
              _title: true,
              link: {
                __typename: true,
                on_CustomTextComponent: {
                  text: true,
                },
                on_PageReferenceComponent: {
                  page: {
                    pathname: true,
                    _title: true,
                  },
                },
              },
            },
          },
        },
      },
      rightCtas: {
        items: {
          _id: true,
          label: true,
          href: true,
          type: true,
          icon: true,
        },
      },
    },
    footer: {
      copyright: true,
      navbar: {
        items: {
          _title: true,
          url: true,
        },
      },
      socialLinks: {
        _title: true,
        icon: {
          url: true,
        },
        url: true,
      },
    },
    pages: {
      items: {
        _id: true,
        _title: true,
        pathname: true,
        _analyticsKey: true,
        metadataOverrides: {
          title: true,
          description: true,
        },
        sections: {
          __typename: true,
          on_HeroComponent: {
            _id: true,
            _analyticsKey: true,
            title: true,
            subtitle: true,
            customerSatisfactionBanner: {
              text: true,
              avatars: {
                items: {
                  _id: true,
                  avatar: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
            actions: {
              _id: true,
              href: true,
              label: true,
              type: true,
            },
          },
          on_FeaturesGridComponent: {
            _id: true,
            _analyticsKey: true,
            heading: {
              title: true,
              subtitle: true,
              tag: true,
              align: true,
            },
            features: {
              items: {
                _id: true,
                title: true,
                description: true,
                icon: true,
              },
            },
          },
          on_PricingComponent: {
            _id: true,
            _analyticsKey: true,
            heading: {
              title: true,
              subtitle: true,
              tag: true,
              align: true,
            },
            plans: {
              items: {
                _id: true,
                name: true,
                price: true,
                description: true,
                features: {
                  items: {
                    _id: true,
                    text: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    generalEvents: {
      ingestKey: true,
    },
  },
};

export {
  basicSiteQuery,
  settingsQuery,
  pagesQuery,
  headerQuery,
  footerQuery,
  themeQuery,
  fullQuery,
};
